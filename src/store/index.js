import Vue from 'vue'
import Vuex from 'vuex'
import firebase from "firebase/app"
import "firebase/auth"
import db from "../firebase/firebaseInit"
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    sampleBlogCards:[
      {
        blogTitle:"Blog Card #1",
        blogCoverPhoto:"stock-1",
        blogDate:"May 1, 2021"
      },
      {
        blogTitle:"Blog Card #2",
        blogCoverPhoto:"stock-2",
        blogDate:"May 1, 2021"
      },
      {
        blogTitle:"Blog Card #3",
        blogCoverPhoto:"stock-3",
        blogDate:"May 1, 2021"
      },
      {
        blogTitle:"Blog Card #4",
        blogCoverPhoto:"stock-4",
        blogDate:"May 1, 2021"
      },
    ],
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
  },
  actions: {
    async getCurrentUser({commit}){
      const database = await db.collection('users').doc(firebase.auth().currentUser.uid)
      const dbResults = await database.get();
      commit("SET_PROFILE_INFO", dbResults);
      commit("SET_PROFILE_INITIALS")
    },
  },
  modules: {
  }
})
