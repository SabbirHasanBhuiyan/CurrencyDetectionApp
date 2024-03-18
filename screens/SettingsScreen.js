import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firebase } from '../config';

const newsFeed = () => {
  const [postText, setPostText] = useState('');
  const [commentTexts, setCommentTexts] = useState({});
  const [posts, setPosts] = useState([]);
  const [userName, setUserName] = useState('');
  const [userID, setUserId] = useState('');
  useEffect(() => {
    setUserId(firebase.auth().currentUser.uid);
    let x=searchUserByUserID(firebase.auth().currentUser.uid);
    console.log(x);
   // setUserName(x);
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsSnapshot = await firebase.firestore().collection('posts').get();
        const fetchedPosts = [];
        for (const doc of postsSnapshot.docs) {
          const postData = doc.data();
          const postId = doc.id;
          // Fetch comments for the current post
          const commentsSnapshot = await firebase.firestore().collection('comments').doc(postId).collection('comments').get();
          const comments = commentsSnapshot.docs.map(commentDoc => commentDoc.data());
          // Fetch likes and dislikes for the current post
          const likesOrDislikesSnapshot = await firebase.firestore().collection('likesOrDislikes').doc(postId).collection('users').get();
          const likesOrDislikesData = likesOrDislikesSnapshot.docs.map(userDoc => userDoc.id);
          const likedByCurrentUser = likesOrDislikesData.includes(firebase.auth().currentUser.uid);
          const dislikedByCurrentUser = false; // Implement logic to check if current user disliked this post
          const formattedPost = {
            id: postId,
            ...postData,
            likedByCurrentUser,
            dislikedByCurrentUser,
            comments,
          };
          fetchedPosts.push(formattedPost);
        }
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
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
        console.log("Error getting documents: ", error);
      });

  };
  const handlePost = () => {
    if (postText.trim() !== '') {
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
        name: userName, // Replace with user's name
        date: getDateTimeString(), // Current date
        content: postText,
        likes: 0,
        dislikes: 0,
      };
  
      console.log(userID);
      console.log(userName);
  
      // Add the post to Firestore with the specified document ID
      firebase.firestore()
        .collection('posts')
        .doc(postId) // Specify the document ID here
        .set(newPostToDB)
        .then(() => {
          console.log('Post added with ID: ', postId);
          // Update local state after successfully adding the post
          setPosts([newPost, ...posts]);
          setPostText('');
        })
        .catch(error => {
          console.error('Error adding post: ', error);
        });
    }
  };
  

  const updateLikesOrDislikes = async (postId, userId, value) => {
    try {
      // Construct the path
      const path = `likesOrDislikes/${postId}/${userId}/${userName}`;
      // Set the value in Firestore
      await firebase.firestore().doc(path).set({ value });
      console.log('Likes or dislikes updated successfully.');
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
      console.log('Post likes and dislikes updated successfully.');
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
