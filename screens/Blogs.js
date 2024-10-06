import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firebase } from '../config';

const Blogs = () => {
  const [loading, setLoading] = useState(true); // State variable to track loading state
  const [postText, setPostText] = useState('');
  const [commentTexts, setCommentTexts] = useState({});
  const [posts, setPosts] = useState([]);
  const [userName, setUserName] = useState('');
  const [userID, setUserId] = useState('');

  useEffect(() => {
    setUserId(firebase.auth().currentUser.uid);
    let x=searchUserByUserID(firebase.auth().currentUser.uid);
   // setUserName(x);
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsSnapshot = await firebase.firestore().collection('posts').get();
        for (const doc of postsSnapshot.docs) {
          const postData = doc.data();
          const postId = doc.id;
          await firebase.firestore().collection("likesOrDislikes").doc(postId+' '+firebase.auth().currentUser.uid)
            .get()
            .then((snapshot) => {
              if (snapshot.exists) { // Check if the document exists
                const likedByCurrentUser = snapshot.data().value===1? 1 : 0 ;
                const dislikedByCurrentUser = snapshot.data().value===2? 1 : 0; // Implement logic to check if current user disliked this post
                const formattedPost = {
                  id: postId,
                  ...postData,
                  likedByCurrentUser,
                  dislikedByCurrentUser,
                };
                setPosts(prevPosts => [...prevPosts, formattedPost]); // Update posts state with the new post
              } else {
                const likedByCurrentUser =   0 ;
                const dislikedByCurrentUser =    0; // Implement logic to check if current user disliked this post
                const formattedPost = {
                  id: postId,
                  ...postData,
                  likedByCurrentUser,
                  dislikedByCurrentUser,
                };
                setPosts(prevPosts => [...prevPosts, formattedPost]); // Update posts state with the new post
              }
              // You can use the value here or perform other operations
            })
            .catch((error) => {
              console.error("Error getting document:", error);
            });
        }
        setLoading(false); // Set loading to false after fetching all posts
      } catch (error) {
        console.error('Error fetching posts:', error);
        setLoading(false); // Set loading to false if there's an error
      }
    };
  
    fetchPosts();
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
      });

  };
  const handlePost = () => {
    if (postText.trim() !== '') {
      setLoading(true);
      const date = new Date();
      const postId = firebase.auth().currentUser.uid + ' ' + getDateTimeString();
      const newPost = {
        id: postId,
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
        id: postId,
        name: userName, // Replace with user's name
        date: getDateTimeString(), // Current date
        content: postText,
        likes: 0,
        dislikes: 0,
        comments: [],
      };
  
  
      // Add the post to Firestore with the specified document ID
      setPosts([newPost, ...posts]);

      firebase.firestore()
        .collection('posts')
        .doc(postId) // Specify the document ID here
        .set(newPostToDB)
        .then(() => {
          // Update local state after successfully adding the post
          setPostText('');
        })
        .catch(error => {
        });
        setLoading(false);

    }
  };
  

  const updateLikesOrDislikes = async (postId, userId, value) => {
    try {
      // Construct the path
      // Set the value in Firestore
      await firebase.firestore().collection('likesOrDislikes').doc(postId+' '+userID).set({ value: value });
    } catch (error) {
      console.error('Error updating likes or dislikes:', error);
    }
  };
  
  const updatePostLikesAndDislikes = async (postId, likes, dislikes) => {
    try {
      await firebase.firestore().collection('posts').doc(postId).update({
        likes: likes,
        dislikes: dislikes
      });
    } catch (error) {
      console.error('Error updating post likes and dislikes:', error);
    }
  };
  
  const handleLike = async (postId) => {
    const userId = firebase.auth().currentUser.uid;
    const post = posts.find(post => post.id === postId);
    if (post) {
      const newValue = post.likedByCurrentUser ? 0 : 1;
      const updatedLikes = newValue === 1 ? post.likes + 1 : (post.likedByCurrentUser ? post.likes - 1 : post.likes);
      const updatedDislikes = newValue === 1 && post.dislikedByCurrentUser ? post.dislikes - 1 : post.dislikes;
      // Update Firestore with the new values
      await Promise.all([
        updateLikesOrDislikes(postId, userId, newValue),
        updatePostLikesAndDislikes(postId, updatedLikes, updatedDislikes)
      ]);
      // Update local state
      const updatedPosts = posts.map(p =>
        p.id === postId
          ? {
              ...p,
              likes: updatedLikes,
              dislikes: updatedDislikes,
              likedByCurrentUser: newValue === 1,
              dislikedByCurrentUser: false,
            }
          : p
      );
      setPosts(updatedPosts);
    }
  };
  
  const handleDislike = async (postId) => {
    const userId = firebase.auth().currentUser.uid;
    const post = posts.find(post => post.id === postId);
    if (post) {
      const newValue = post.dislikedByCurrentUser ? 0 : 2;
      const updatedDislikes = newValue === 2 ? post.dislikes + 1 : (post.dislikedByCurrentUser ? post.dislikes - 1 : post.dislikes);
      const updatedLikes = newValue === 2 && post.likedByCurrentUser ? post.likes - 1 : post.likes;
      // Update Firestore with the new values
      await Promise.all([
        updateLikesOrDislikes(postId, userId, newValue),
        updatePostLikesAndDislikes(postId, updatedLikes, updatedDislikes)
      ]);
      // Update local state
      const updatedPosts = posts.map(p =>
        p.id === postId
          ? {
              ...p,
              dislikes: updatedDislikes,
              likes: updatedLikes,
              dislikedByCurrentUser: newValue === 2,
              likedByCurrentUser: false,
            }
          : p
      );
      setPosts(updatedPosts);
    }
  };
  
  

  const addCommentToFirestore = async (postId, newComment) => {
    try {
      const postRef = firebase.firestore().collection('posts').doc(postId);
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
      {loading && (
        <ActivityIndicator size="large" color="#0000ff" />
      ) }
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

export default Blogs;