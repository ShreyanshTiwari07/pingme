import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar= async(req,res)=>{
    try {
        const loggedInUserId= req.user._id;
        const filteredUser= await User.find({_id: {$ne: loggedInUserId}});
        res.status(200).json(filteredUser);
        
    } catch (error) {
        console.error("Error in getUsersForSidebar controller: ", error.message);
        res.status(500).json({error: "Internal server error"});
        
    }
};

export const getMessages= async(req,res)=>{
try {
    const {id: userTochatId}= req.params;
    const myId= req.user._id;

    const messages=await Message.find({
    $or:
    [
        {senderId: myId, receiverId: userTochatId},
        {senderId: userTochatId, receiverId: myId}
    ],
    // Filter out messages deleted for this user
    deletedFor: { $ne: myId }
    });

    // Transform messages to hide content if deleted for everyone
    const transformedMessages = messages.map(msg => {
        if (msg.deletedForEveryone) {
            return {
                ...msg.toObject(),
                text: null,
                image: null,
                deletedForEveryone: true
            };
        }
        return msg;
    });

    res.status(200).json(transformedMessages);
} catch (error) {
    console.error("Error in getMessages controller: ", error.message);
    res.status(500).json({error: "Internal server error"});
}
}


export const sendMessage= async (req,res)=>{
    try {
        const {text, image}= req.body;
        const {id: receiverId}= req.params;
        const senderId= req.user._id;

        let imageUrl;
        if(image){

            const uploadResponse= await cloudinary.uploader.upload(image);
            imageUrl= uploadResponse.secure_url;
        }

        const newMessage= new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        // Real-time functionality with socket.io
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
    console.error("Error in sendMessage controller: ", error.message);
    res.status(500).json({error: "Internal server error"});

    }

}

// Delete message for me only
export const deleteMessageForMe = async (req, res) => {
    try {
        const { messageId } = req.params;
        const myId = req.user._id;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        // Check if user is part of this conversation
        if (message.senderId.toString() !== myId.toString() &&
            message.receiverId.toString() !== myId.toString()) {
            return res.status(403).json({ error: "Not authorized to delete this message" });
        }

        // Add user to deletedFor array
        await Message.findByIdAndUpdate(messageId, {
            $addToSet: { deletedFor: myId }
        });

        res.status(200).json({ message: "Message deleted for you" });
    } catch (error) {
        console.error("Error in deleteMessageForMe controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Delete message for everyone
export const deleteMessageForEveryone = async (req, res) => {
    try {
        const { messageId } = req.params;
        const myId = req.user._id;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        // Only the sender can delete for everyone
        if (message.senderId.toString() !== myId.toString()) {
            return res.status(403).json({ error: "Only the sender can delete for everyone" });
        }

        // Update message to be deleted for everyone
        const updatedMessage = await Message.findByIdAndUpdate(
            messageId,
            { deletedForEveryone: true },
            { new: true }
        );

        // Notify the receiver in real-time
        const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageDeleted", {
                messageId,
                deletedForEveryone: true
            });
        }

        res.status(200).json({
            message: "Message deleted for everyone",
            messageId,
            deletedForEveryone: true
        });
    } catch (error) {
        console.error("Error in deleteMessageForEveryone controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};