<template>
  <q-page class="flex flex-center">
    <img alt="IEEN logo" src="~assets/IEEN300.png" style="width: 250px" />
  </q-page>
</template>


<script>
import { defineComponent } from "vue";
import { useRoute, useRouter } from "vue-router";
export default defineComponent({
  name: "IndexPage",
  setup() {
    // const route = useRoute();
    // const router = useRouter();
    // console.log(route.query);
    // if (route.query.key) {
    //   localStorage.setItem("token", route.query.key);
    // } else {
    //   router.push({
    //     name: "notFount",
    //   });
    // }
  },
});
</script>
