import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/Home.vue"),
    meta: {
      title: "工具集首页"
    }
  },
  {
    path: "/excel-export",
    name: "ExcelExport",
    component: () => import("../views/ExcelExport.vue"),
    meta: {
      title: "Excel导出配置工具"
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || "工具集";
  next();
});

export default router;
