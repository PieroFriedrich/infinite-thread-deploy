import { useNavigate } from "react-router-dom";
import React from "react";
import axios from "axios";
import HeartIcon from "../images/heart_icon.svg";
import FilledHeartIcon from "../images/filled_heart_icon.svg";

function LikeButton({ postId, isLiked, likeCount, onLikeChange }) {
  const navigate = useNavigate();

  const handleLike = async () => {
    console.log("Like button clicked for post ID:", postId);
    console.log("Current isLiked state:", isLiked);

    try {
      const userEmail = JSON.parse(localStorage.user).email;
      console.log("User email:", userEmail);

      if (isLiked) {
        // Unlike the post
        console.log("Sending request to unlike post ID:", postId);
        const response = await axios.delete(
          `${import.meta.env.VITE_HOST}/likes`,
          {
            data: { postId },
            headers: { "x-username": userEmail },
          }
        );
        console.log("Unlike response:", response);
        onLikeChange(response.data.likeCount || likeCount - 1, false);
      } else {
        // Like the post
        console.log("Sending request to like post ID:", postId);
        const response = await axios.post(
          `${import.meta.env.VITE_HOST}/likes`,
          { postId },
          { headers: { "x-username": userEmail } }
        );
        console.log("Like response:", response);
        onLikeChange(response.data.likeCount || likeCount + 1, true);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      console.error("Error response:", error.response);
      navigate("/login");
    }
  };

  return (
    <button className="flex items-center" onClick={handleLike}>
      <img
        src={isLiked ? FilledHeartIcon : HeartIcon}
        alt="Like Button"
        width={20}
        height={20}
        className="transform hover:scale-110 transition-transform duration-200"
      />
    </button>
  );
}

export default LikeButton;
