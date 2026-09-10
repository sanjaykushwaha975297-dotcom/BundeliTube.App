import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Watch from '../views/Watch.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/watch/:id',
    name: 'Watch',
    component: Watch,
  },
  {
    path: '/studio',
    name: 'Studio',
    component: () => import(/* webpackChunkName: "studio" */ '../views/Studio/Dashboard.vue'),
  },
  {
    path: '/trending',
    name: 'Trending',
    component: Home,
  },
  {
    path: '/subscriptions',
    name: 'Subscriptions',
    component: Home,
  },
  {
    path: '/history',
    name: 'History',
    component: Home,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
