import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firebase } from '../config';

const newsFeed = () => {
  const [postText, setPostText] = useState('');
  const [commentTexts, setCommentTexts] = useState({});
  const [posts, setPosts] = useState([
    { id: 1, name: 'John Doe', date: 'March 16, 2024', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod magna eu neque ultricies, non convallis justo venenatis.', likes: 0, dislikes: 0, likedByCurrentUser: false, dislikedByCurrentUser: false, comments: [] },
    { id: 2, name: 'Jane Smith', date: 'March 15, 2024', content: 'Nulla facilisi. Donec sit amet enim quis lectus dictum hendrerit ac non justo.', likes: 0, dislikes: 0, likedByCurrentUser: false, dislikedByCurrentUser: false, comments: [] },
    // Add more posts here
  ]);
  const [userName, setUserName] = useState('');
  const [userID, setUserId] = useState('');
  useEffect(() => {
    setUserId(firebase.auth().currentUser.uid);
    let x=searchUserByUserID(firebase.auth().currentUser.uid);
    console.log(x);
   // setUserName(x);
  }, []);

  const getDateTimeString = () => {
    const date = new Date();
  
    // Adjust for GMT+6 (Bangladesh Standard Time)
    const offset = 6 * 60 * 60 * 1000; // 6 hours offset in milliseconds
    const localTime = new Date(date.getTime() + offset);
  
    // Format date string in YYYY-MM-DD format
    const dateString = localTime.toISOString().split('T')[0];
  
    // Format time string in HH:MM:SS format
    const timeString = localTime.toISOString().split('T')[1].split('.')[0];
  
    return dateString + ' ' + timeString;
  };
  
  const searchUserByUserID = async (userID) => {
    firebase.firestore().collection("users").where("userID", "==", userID)
      .get()
      .then((snapshot) => {
        if (!snapshot.empty) {
          setUserName(snapshot.docs[0].data().userName);
        //  return snapshot.docs[0].data().userName;
        } else {
        //  return "";
        }
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });

  };
  const handlePost = () => {
    if (postText.trim() !== '') {
      const date = new Date();
      const newPost = {
        id: firebase.auth().currentUser.uid + ' ' + getDateTimeString(),
        name: userName, // Replace with user's name
        date: getDateTimeString(), // Current date
        content: postText,
        likes: 0,
        dislikes: 0,
        likedByCurrentUser: false,
        dislikedByCurrentUser: false,
        comments: [],
      };
      const newPostToDB = {
        id: newPost.id,
        name: userName, // Replace with user's name
        date: newPost.date, // Current date
        content: postText,
        likes: 0,
        dislikes: 0,
      };

      console.log(userID);
      console.log(userName);

      // Add the post to Firestore      
      setPosts([newPost, ...posts]);

      try{
        firebase.firestore()
        .collection('posts')
        .add(newPostToDB)
        .then(docRef => {
          console.log('Post added with ID: ', docRef.id);
        })
        .catch(error => {
          console.error('Error adding post: ', error);
        });
      }catch(e){
        console.log(e);
      }

       setPostText('');
    }
  };

  const handleLike = (postId) => {
    const updatedPosts = posts.map(post =>
      post.id === postId
        ? {
          ...post,
          likes: post.likedByCurrentUser ? post.likes - 1 : post.likes + 1,
          dislikes: post.dislikedByCurrentUser ? post.dislikes - 1 : post.dislikes,
          likedByCurrentUser: !post.likedByCurrentUser,
          dislikedByCurrentUser: false,
        }
        : post
    );
    setPosts(updatedPosts);
  };

  const handleDislike = (postId) => {
    const updatedPosts = posts.map(post =>
      post.id === postId
        ? {
          ...post,
          dislikes: post.dislikedByCurrentUser ? post.dislikes - 1 : post.dislikes + 1,
          likes: post.likedByCurrentUser ? post.likes - 1 : post.likes,
          dislikedByCurrentUser: !post.dislikedByCurrentUser,
          likedByCurrentUser: false,
        }
        : post
    );
    setPosts(updatedPosts);
  };

  const addCommentToFirestore = async (postId, newComment) => {
    try {
      const postRef = firebase.firestore().collection('comments').doc(postId);
      const doc = await postRef.get();
      if (doc.exists) {
        // If the document exists, update the 'comments' field with the new comment
        await postRef.update({
          comments: firebase.firestore.FieldValue.arrayUnion(newComment)
        });
      } else {
        // If the document does not exist, create it with the 'comments' field
        await postRef.set({
          comments: [newComment]
        });
      }
      console.log('Comment added successfully.');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };
  
  
  const handleComment = (postId) => {
    const commentText = commentTexts[postId];
    if (commentText && commentText.trim() !== '') {
      const newComment = {
        id: firebase.auth().currentUser.uid + ' ' + getDateTimeString(), // Generate a unique ID for the comment
        name: userName, // Replace with user's name
        date: getDateTimeString(), // Current date and time
        content: commentText,
      };
  
      // Add the comment to Firestore
      addCommentToFirestore(postId, newComment);
  
      // Update local state
      const updatedPosts = posts.map(post =>
        post.id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      );
      setPosts(updatedPosts);
      setCommentTexts(prevState => ({ ...prevState, [postId]: '' }));
    }
  };
  

  const handleCommentChange = (postId, text) => {
    setCommentTexts(prevState => ({ ...prevState, [postId]: text }));
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
              <TouchableOpacity onPress={() => handleDislike(post.id)}>
                <Ionicons name={post.dislikedByCurrentUser ? 'thumbs-down' : 'thumbs-down-outline'} size={24} color={post.dislikedByCurrentUser ? 'blue' : 'gray'} />
              </TouchableOpacity>
              <Text style={styles.likeCount}>{post.dislikes}</Text>
              <TouchableOpacity>
                <Ionicons name="chatbubble-ellipses" size={24} color="gray" />
              </TouchableOpacity>
            </View>
            {/* Comment Section */}
            <View style={styles.commentSection}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                value={commentTexts[post.id] || ''}
                onChangeText={text => handleCommentChange(post.id, text)}
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

export default newsFeed;
