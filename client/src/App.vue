<template>
  <div id="app">
    <div class="container mt-4">
      <div class="upload-section text-center">
        <h3 class="pb-2">Image repository</h3>
        <div class="text-left pt-2 mt-3 mb-2" v-if="!isLoggedIn">
          <h5>Login</h5>
          <label class="mr-1">Username:</label>
          <input type="text" v-model="userHolder" />
          <label class="ml-2 mr-1">Password:</label>
          <input type="text" v-model="passHolder" />
          <b-button @click="login()" size="sm" variant="success" class="ml-2 mb-1">Login</b-button>
        </div>
        <div v-else class="text-left mt-3">
          <h5 class="pl-3">
            Hi,
            <span style="font-size: 25px;">{{ username }}.</span>
            <b-button size="sm" variant="danger" class="ml-3" @click="logout()">Logout</b-button>
          </h5>
        </div>
        <UploadImages ref="imageUploader" />
        <div class="mt-2">Permission:</div>
        <div class="mt-2">
          <b-form-radio-group
            id="btn-radios-1"
            v-model="uploadPermission"
            :options="options"
            name="radios-btn-default"
            buttons
          ></b-form-radio-group>
        </div>
        <b-button variant="success" class="mt-2" @click="uploadImages">Upload</b-button>
      </div>
      <h4 class="mt-3 my-border pb-3">
        Gallery
        <b-button
          class="float-right"
          v-if="isLoggedIn && toDelete.length > 0"
          @click="deleteImages()"
          size="sm"
          variant="danger"
        >Delete selected</b-button>
      </h4>

      <div class="row mt-1 pt-3">
        <div class="col-3 mb-4" v-for="(img, idx) in images" :key="idx">
          <img class="border" :src="`${api}/images/${img.src}`" target="_blank" />
          <div>Uploaded by: {{ img.user }}</div>
          <div>Permission: {{ img.permission }}</div>
          <div v-if="username == img.user">
            <b-form-checkbox v-model="toDelete" :value="img.src">Delete</b-form-checkbox>
          </div>
          <div style="margin-bottom: 125px;"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UploadImages from "vue-upload-drop-images";
export default {
  name: "App",
  components: {
    UploadImages
  },
  data() {
    return {
      userHolder: "",
      passHolder: "",
      isLoggedIn: false,
      username: "",
      password: "",
      toDelete: [],
      api: "http://localhost:3000",
      images: [],
      uploadPermission: "public",
      options: [
        { text: "Public", value: "public" },
        { text: "Private", value: "private" }
      ]
    };
  },
  mounted() {
    this.fillData();
  },
  methods: {
    async uploadImages() {
      // Check that user is loggedIn
      if (!this.isLoggedIn) {
        alert("Please login to upload images.");
        return;
      }

      // Ensure something exists that they're trying to upload
      if (this.$refs.imageUploader.Imgs.length === 0) {
        alert("Please attach atleast one photo!");
        return;
      }

      // Upload image with user and file data
      await this.axios.post(`${this.api}/uploadImages`, {
        permission: this.uploadPermission,
        imgs: this.$refs.imageUploader.Imgs,
        user: this.username
      });

      // Refresh data with new images
      await this.fillData();
      this.$refs.imageUploader.Imgs = [];
      this.$refs.imageUploader.files = [];
    },

    // Method to refresh data, called everytime the backend changes
    async fillData() {
      this.toDelete = [];
      this.images = (
        await this.axios.post(`${this.api}/images`, { user: this.username })
      ).data;
    },

    // Method to call the delete images endpoint
    async deleteImages() {
      await this.axios.post(`${this.api}/deleteImages`, {
        toDelete: this.toDelete
      });
      this.fillData();
    },

    // Mock login function
    login() {
      this.username = this.userHolder;
      this.isLoggedIn = true;
      this.fillData();
    },

    // Mock logout function
    logout() {
      this.username = "";
      this.userHolder = "";
      this.passHolder = "";
      this.isLoggedIn = false;
      this.fillData();
    }
  }
};
</script>

<style>
body {
  margin-bottom: 200px;
}

.container {
  padding-bottom: 200px;
}

.my-border {
  border-bottom: 2px solid rgb(172, 169, 169);
}

img {
  max-height: 200px;
  max-width: 200px;
  width: 100%;
  height: 100%;
}
</style>
