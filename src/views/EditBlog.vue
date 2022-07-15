<template>
  <div class="create-post">
    <BlogCoverPreview v-show="this.$store.state.blogPhotoPreview"/>
    <Loading v-show="loading"/>
    <div class="container">
        <div :class="{invisible:!error}" class="err-message">
            <p><span>Error: </span>{{this.errorMsg}} </p>
        </div>
        <div class="blog-info">
            <input type="text" placeholder="Enter Blog Title" v-model="blogTitle">
            <div class="upload-file">
                <label for="blog-photo">Upload Cover Photo</label>
                <input @change="fileChange" type="file" ref="blogPhoto" id="blog-photo" accept=".png, .jpf, .jpeg">
                <button @click="openPreview" class="preview" :class="{'button-inactive':!this.$store.state.blogPhotoFileURL}">Preview Photo</button>
                <span>File Chosen: {{this.$store.state.blogPhotoName}}</span>
            </div>
        </div>
        <div class="editor">
            <vue-editor @image-added='imageHandler' :editorOptions='editorSettings' v-model="blogHTML" useCustomImageHandler />
        </div>
        <div class="blog-actions">
            <button @click="updateBlog">Save Changes</button>
            <router-link class="router-button" :to="{name:'BlogPreview'}">Preview Changes</router-link>
        </div>
    </div>
  </div>
</template>

<script>
import Quill from "quill";
import BlogCoverPreview from '../components/BlogCoverPreview.vue'
import Loading from '../components/Loading.vue'
import firebase from "firebase/app"
import "firebase/storage"
import db from '../firebase/firebaseInit'
window.Quill = Quill;
const ImageResize = require("quill-image-resize-module").default;
Quill.register("modules/imageResize", ImageResize);
export default {
    name:'CreatePost',
    components: {
        BlogCoverPreview,
        Loading
    },
    async mounted () {
      this.routeID = this.$route.params.blogid;
      this.currentBlog = await this.$store.state.blogPosts.filter((post)=>{
        return post.blogID === this.routeID
      })
      this.$store.commit('SET_BLOG_STATE', this.currentBlog[0])
    },
    data() {
        return {
            file:null,
            error: null,
            currentBlog:null,
            routeID:null,
            errorMsg:null,
            loading:null,
            editorSettings:{
                modules:{
                    imageResize:{

                    }
                }
            }
        }
    },
    methods: {
        async updateBlog(){
          const dataBase = await db.collection('blogPosts').doc(this.routeID)
            if(this.blogTitle.length !== 0 && this.blogTitle.length !== 0){
                if(this.file){
                    this.loading = true
                    const storageRef = firebase.storage().ref()
                    const docRef = storageRef.child(`documents/BlogCoverPhotos/${this.$store.state.blogPhotoName}`)
                    docRef.put(this.file).on("state_changed", (snapshot)=>{
                        console.log(snapshot);
                    }, (err)=>{
                        this.loading = false
                        console.log(err);
                    }, async()=>{
                        const downloadURL = await docRef.getDownloadURL()

                        await dataBase.update({
                            blogHTML:this.blogHTML,
                            blogCoverPhoto:downloadURL,
                            blogCoverPhotoName:this.blogCoverPhotoName,
                            blogTitle:this.blogTitle,
                        })
                        await this.$store.dispatch('updatePost', this.routeID)
                        this.loading = false
                        this.$router.push({name:"ViewBlog", params:{blogid:dataBase.id}})
                    })
                    return
                }
                this.loading = true
                await dataBase.update({
                  blogHTML:this.blogHTML,
                  blogTitle:this.blogTitle,
                })
               await this.$store.dispatch('updatePost',this.routeID)
               this.loading = false
               this.$router.push({name:'ViewBlog', params:{blogid:dataBase.id}})
            }
            this.error = true
            this.errorMsg = "Please ensure Blog Title & Blog Post has been filled!"
            setTimeout(() => {
                this.error = false
            }, 5000);
        },
        imageHandler(file,Editor,cursorLocation,resetUploader){
            const storageRef = firebase.storage().ref()
            const docRef = storageRef.child(`documents/blogPostPhotos/${file.name}`)
            docRef.put(file).on('state_changed', (snapshot)=>{
                console.log(snapshot);
            },(err)=>{
                console.log(err);
            }, async()=>{
                const downloadURL = await docRef.getDownloadURL()
                Editor.insertEmbed(cursorLocation, 'image', downloadURL)
                resetUploader()
            })
        },
        openPreview(){
            this.$store.commit('OPEN_PHOTO_PREVIEW')
        },
        fileChange() {
            this.file = this.$refs.blogPhoto.files[0]
            const fileName = this.file.name
            this.$store.commit('FILENAME_CHANGE', fileName)
            this.$store.commit('CREATE_FILE_URL', URL.createObjectURL(this.file))
        }
    },
    computed: {
        profileId() {
            return this.$store.state.profileId 
        },
        blogCoverPhotoName(){
            return this.$store.state.blogPhotoName 
        },
        blogTitle:{
            get(){
                return this.$store.state.blogTitle
            },
            set(payload){
                this.$store.commit('UPDATE_BLOG_TITLE',payload)
            }
        },
        blogHTML:{
            get(){
                return this.$store.state.blogHTML
            },
            set(payload){
                this.$store.commit('NEW_BLOG_POST',payload)
            }
        },
    },
}
</script>

<style lang="scss">
.create-post{
    position: relative;
    height: 100%;

    button{
        margin-top: 0;
    }
    .router-button{
        text-decoration: none;
        color: white;
    }
    label,
    button,
    .router-button {
        transition: 0.5s ease-in-out all;
        align-self: center;
        font-size: 14px;
        cursor: pointer;
        border-radius: 20px;
        padding: 12px 24px;
        color: #fff;
        background-color: #303030;
        text-decoration: none;
        &:hover {
        background-color: rgba(48, 48, 48, 0.7);
        }
    }
    .container{
        position: relative;
        height: 100%;
        padding: 10px 25px 60px;
    }

    // Error styling
    .invisible{
        opacity: 0 !important;
    }
    .err-message{
        width: 100%;
        padding: 12px;
        border-radius: 8px;
        color: white;
        margin-bottom: 10px;
        background-color: #303030;
        opacity: 1;
        transition: .5s ease all;
        p{
            font-size: 14px;
        }
        span{
            font-weight: 600;
        }
    }
    .blog-info{
        display: flex;
        margin-bottom: 32px;

        input:nth-child(1){
            min-width: 300px;
        }
        input{
            transition: .5s ease-in-out all;
            padding: 10px 4px;
            border: none;
            border-bottom: 1px solid #303030;

            &:focus{
                outline: none;
                box-shadow: 0 1px 0 0 #303030;
            }
        }
        .upload-file{
            flex: 1;
            margin-left: 16px;
            position: relative;
            display: flex;

            input{
                display: none;
            }
            .preview{
                margin-left: 16px;
                text-transform: initial;
            }
            span{
                font-size: 12px;
                margin-left: 16px;
                align-self: center;
            }
        }
    }
    .editor{
        height: 60vh;
        display: flex;
        flex-direction: column;

        .quillWrapper{
            position: relative;
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        .ql-container{
            display: flex;
            flex-direction: column;
            height: 100%;
            overflow: scroll;
        }
        .ql-editor{
            padding: 20px 16px 30px;
        }
    }
    .blog-actions{
        margin-top: 32px;

        button{
            margin-right: 16px;
        }
    }
}
</style>