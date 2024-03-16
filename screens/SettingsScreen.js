import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FacebookNewsFeed = () => {
  const [postText, setPostText] = useState('');
  const [commentText, setCommentText] = useState('');
  const [posts, setPosts] = useState([
    { id: 1, name: 'John Doe', date: 'March 16, 2024', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod magna eu neque ultricies, non convallis justo venenatis.', likes: 0, likedByCurrentUser: false, comments: [] },
    { id: 2, name: 'Jane Smith', date: 'March 15, 2024', content: 'Nulla facilisi. Donec sit amet enim quis lectus dictum hendrerit ac non justo.', likes: 0, likedByCurrentUser: false, comments: [] },
    // Add more posts here
  ]);

  const handlePost = () => {
    if (postText.trim() !== '') {
      const newPost = {
        id: posts.length + 1,
        name: 'Your Name', // Replace with user's name
        date: new Date().toDateString(), // Current date
        content: postText,
        likes: 0,
        likedByCurrentUser: false,
        comments: [],
      };
      setPosts([newPost, ...posts]);
      setPostText('');
    }
  };

  const handleLike = (postId) => {
    const updatedPosts = posts.map(post =>
      post.id === postId
        ? {
            ...post,
            likes: post.likedByCurrentUser ? post.likes - 1 : post.likes + 1,
            likedByCurrentUser: !post.likedByCurrentUser,
          }
        : post
    );
    setPosts(updatedPosts);
  };

  const handleComment = (postId) => {
    if (commentText.trim() !== '') {
      const newComment = {
        id: posts[postId - 1].comments.length + 1,
        name: 'Your Name', // Replace with user's name
        date: new Date().toDateString(), // Current date
        content: commentText,
      };
      const updatedPosts = posts.map(post =>
        post.id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      );
      setPosts(updatedPosts);
      setCommentText('');
    }
  };

  return (
    <View style={styles.container}>
      {/* Posting Option */}
      <View style={styles.postingOption}>
        <TextInput
          style={styles.postInput}
          placeholder="What's on your mind?"
          value={postText}
          onChangeText={text => setPostText(text)}
        />
        <TouchableOpacity onPress={handlePost}>
          <Ionicons name="paper-plane" size={24} color="blue" />
        </TouchableOpacity>
      </View>

      {/* Posts from Others */}
      <ScrollView style={styles.postsContainer}>
        {posts.map(post => (
          <View key={post.id} style={styles.post}>
            <View style={styles.postHeader}>
              <Text style={styles.postHeaderName}>{post.name}</Text>
              <Text style={styles.postHeaderDate}>{post.date}</Text>
            </View>
            <Text style={styles.postContent}>{post.content}</Text>
            <View style={styles.postActions}>
              <TouchableOpacity onPress={() => handleLike(post.id)}>
                <Ionicons name={post.likedByCurrentUser ? 'thumbs-up' : 'thumbs-up-outline'} size={24} color={post.likedByCurrentUser ? 'blue' : 'gray'} />
              </TouchableOpacity>
              <Text style={styles.likeCount}>{post.likes}</Text>
              <TouchableOpacity>
                <Ionicons name="chatbubble-ellipses" size={24} color="gray" />
              </TouchableOpacity>
            </View>
            {/* Comment Section */}
            <View style={styles.commentSection}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                value={commentText}
                onChangeText={text => setCommentText(text)}
              />
              <TouchableOpacity onPress={() => handleComment(post.id)}>
                <Ionicons name="send" size={24} color="blue" />
              </TouchableOpacity>
            </View>
            {/* Display Comments */}
            {post.comments.map(comment => (
              <View key={comment.id} style={styles.comment}>
                <Text style={styles.commentHeader}>
                  {comment.name} - {comment.date}
                </Text>
                <Text>{comment.content}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  postingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  postInput: {
    flex: 1,
    marginRight: 10,
    padding: 5,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'lightgray',
  },
  postsContainer: {
    flex: 1,
  },
  post: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  postHeaderName: {
    fontWeight: 'bold',
  },
  postHeaderDate: {
    color: 'gray',
  },
  postContent: {
    marginBottom: 10,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  likeCount: {
    marginLeft: 5,
    marginRight: 10,
  },
  commentSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    marginRight: 10,
    padding: 5,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'lightgray',
  },
  comment: {
    marginTop: 10,
    padding: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  commentHeader: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default FacebookNewsFeed;