import { createRouter, createWebHistory } from 'vue-router';
import Albums from '../views/AlbumsList.vue';
import Login from '../views/UserLogin.vue';
import AlbumDetail from '../views/AlbumDetails.vue';
import RegisterUser from '../views/RegisterUser.vue';
import MyReviews from '../views/MyReviews.vue';
import AdminUserList from '../views/AdminUserList.vue';
import AdminAlbums from '../views/AdminAlbums.vue';
import BlindTest from '../views/BlindTest.vue';


const routes = [
  { path: '/', name: 'Albums', component: Albums },
  { path: '/userlogin', name: 'Login', component: Login },
  { path: '/albums/:id', name: 'AlbumDetails', component: AlbumDetail, props: true },
  { path: '/register', name: 'Register', component: RegisterUser },
  { path: '/myreviews', name: 'MyReviews', component: MyReviews },
  { path: '/admin/users', component: AdminUserList },
  { path: '/admin/albums',name: 'AdminAlbums',component: AdminAlbums },
  { path: '/blindtest',name: 'BlindTest',component: BlindTest },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
