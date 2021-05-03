<template>
  <div id="app">
    <div class="container mt-4">
      <div class="upload-section text-center">
        <h3>Image repository</h3>
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
        <button class="btn btn-success mt-2" @click="uploadImages">
          Upload
        </button>
      </div>
      <div class="row mt-4 pt-3">
        <div class="col-3 mb-2" v-for="(img, idx) in images" :key="idx">
          <img :src="`${api}/images/${img.src}`" target="_blank" />
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
      await this.axios.post(`${this.api}/uploadImages`, {
        permission: this.uploadPermission,
        imgs: this.$refs.imageUploader.Imgs
      });

      await this.fillData();
      this.$refs.imageUploader.Imgs = [];
    },
    async fillData() {
      console.log("Filling data");
      this.images = (await this.axios.get(`${this.api}/images`)).data;
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

.row {
  border-top: 3px solid rgb(153, 150, 150);
}

img {
  max-height: 200px;
  max-width: 200px;
  width: 100%;
  height: 100%;
}
</style>
