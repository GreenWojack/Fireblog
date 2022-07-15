import Vue from 'vue'
import Vuex from 'vuex'
import firebase from "firebase/app"
import "firebase/auth"
import db from "../firebase/firebaseInit"
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    blogPosts:[],
    postLoaded:null,
    blogHTML: "Write your blog title here...",
    blogTitle: "",
    blogPhotoName: "",
    blogPhotoFileURL: null,
    blogPhotoPreview: null,
    editPost: null,
    user: null,
    profileAdmin: null,
    profileEmail: null,
    profileFirstName: null,
    profileLastName: null,
    profileUsername: null,
    profileId: null,
    profileInitials: null,
  },
  getters:{
    blogPostsFeed(state){
      return state.blogPosts.slice(0,2)
    },
    blogPostsCards(state){
      return state.blogPosts.slice(2,6)
    },
  },
  mutations: {
    toggleEditPost(state,payload){
      state.editPost = payload
    },
    SET_PROFILE_INFO(state,payload){
      state.profileId = payload.id 
      state.profileEmail = payload.data().email
      state.profileFirstName = payload.data().firstName 
      state.profileLastName = payload.data().lastName 
      state.profileUsername = payload.data().username 

    },
    UPDATE_USER(state,payload){
      state.user = payload
    },
    SET_PROFILE_INITIALS(state) {
      state.profileInitials =
        state.profileFirstName.match(/(\b\S)?/g).join("") + state.profileLastName.match(/(\b\S)?/g).join("");
    },
    CHANGE_FIRST_NAME(state,payload){
      state.profileFirstName = payload
    },
    CHANGE_LAST_NAME(state,payload){
      state.profileLastName = payload
    },
    CHANGE_USERNAME(state,payload){
      state.profileUsername = payload
    },
    SET_PROFILE_ADMIN(state,payload){
      state.profileAdmin = payload
    },
    NEW_BLOG_POST(state,payload){
      state.blogHTML = payload
    },
    UPDATE_BLOG_TITLE(state,payload){
      state.blogTitle = payload
    },
    FILENAME_CHANGE(state,payload){
      state.blogPhotoName = payload
    },
    CREATE_FILE_URL(state,payload){
      state.blogPhotoFileURL = payload
    },
    OPEN_PHOTO_PREVIEW(state){
      state.blogPhotoPreview = !state.blogPhotoPreview
    }, 
    FILTER_BLOG_POST(state,payload){
      state.blogPosts = state.blogPosts.filter(post => post.blogID !== payload)
    },
    SET_BLOG_STATE(state,payload){
      state.blogTitle = payload.blogTitle
      state.blogHTML = payload.blogHTML
      state.blogPhotoFileURL = payload.blogPhotoFileURL
      state.blogPhotoName = payload.blogCoverPhotoName
    }

  },
  actions: {
    async getCurrentUser({commit}, user){
      const database = await db.collection('users').doc(firebase.auth().currentUser.uid)
      const dbResults = await database.get();
      commit("SET_PROFILE_INFO", dbResults);
      commit("SET_PROFILE_INITIALS")
      const token = await user.getIdTokenResult()
      const admin = await token.claims.admin
      commit('SET_PROFILE_ADMIN', admin)
    },
    async updateUserSettings({commit,state}){
      const dataBase = await db.collection('users').doc(state.profileId)
      await dataBase.update({
        firstName: state.profileFirstName,
        lastName:state.profileLastName,
        username:state.profileUsername
      })
      commit("SET_PROFILE_INITIALS")
    },
    async getPost({ state }) {
      const dataBase = await db.collection("blogPosts").orderBy("date", "desc");
      const dbResults = await dataBase.get();
      dbResults.forEach((doc) => {
        if (!state.blogPosts.some((post) => post.blogID === doc.id)) {
          const data = {
            blogID: doc.data().blogID,
            blogHTML: doc.data().blogHTML,
            blogCoverPhoto: doc.data().blogCoverPhoto,
            blogTitle: doc.data().blogTitle,
            blogDate: doc.data().date,
            blogCoverPhotoName: doc.data().blogCoverPhotoName,
          };
          state.blogPosts.push(data);
        }
      });
      state.postLoaded = true;
    },
    async updatePost({commit, dispatch}, payload){
      commit('FILTER_BLOG_POST', payload)
      await dispatch('getPost')
    },
    async deletePost({commit},payload){
      const getPost = await db.collection('blogPosts').doc(payload)
      await getPost.delete();
      commit('FILTER_BLOG_POST', payload)
    },
  },
  modules: {
  }
})
