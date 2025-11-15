const Avatar = ({ src, alt, size = "md" }) => {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-32 h-32"
  };

  // Generate a color based on the name
  const getAvatarColor = (name) => {
    const colors = ['#3E5F44', '#5E936C', '#93DA97'];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

  const handleImageLoad = (e) => {
    e.target.style.display = 'block';
    if (e.target.nextSibling) {
      e.target.nextSibling.style.display = 'none';
    }
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden relative`}>
      {src && (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}
      <div
        className="w-full h-full flex items-center justify-center text-white font-semibold"
        style={{
          backgroundColor: getAvatarColor(alt),
          display: !src ? 'flex' : 'none'
        }}
      >
        {getInitials(alt)}
      </div>
    </div>
  );
};

export default Avatar;
