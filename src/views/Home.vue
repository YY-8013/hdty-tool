<template>
  <div class="home-container">
    <!-- 顶部横幅 -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          <el-icon class="title-icon"><Tools /></el-icon>
          开发工具集
        </h1>
        <p class="hero-subtitle">高效、专业的前端开发工具集合</p>
      </div>
      <div class="hero-decoration">
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
        <div class="decoration-circle circle-3"></div>
      </div>
    </div>

    <!-- 工具卡片区域 -->
    <div class="tools-section">
      <el-row :gutter="24">
        <el-col
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          v-for="tool in tools"
          :key="tool.id"
        >
          <el-card
            class="tool-card"
            shadow="hover"
            @click="navigateToTool(tool.path)"
          >
            <div class="tool-icon" :style="{ background: tool.gradient }">
              <component :is="tool.icon" class="icon" />
            </div>
            <h3 class="tool-title">{{ tool.title }}</h3>
            <p class="tool-description">{{ tool.description }}</p>
            <div class="tool-tags">
              <el-tag
                v-for="tag in tool.tags"
                :key="tag"
                size="small"
                :type="tag.type"
              >
                {{ tag.text }}
              </el-tag>
            </div>
            <div class="tool-footer">
              <span class="tool-status">
                <el-icon><CircleCheck /></el-icon>
                {{ tool.status }}
              </span>
              <el-icon class="arrow-icon"><ArrowRight /></el-icon>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 底部信息 -->
    <div class="footer-section">
      <p class="footer-text">
        <el-icon><InfoFilled /></el-icon>
        持续更新中,更多工具敬请期待...
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  Tools,
  Document,
  CircleCheck,
  ArrowRight,
  InfoFilled
} from "@element-plus/icons-vue";

const router = useRouter();

const tools = ref([
  {
    id: 1,
    title: "Excel导出配置工具",
    description: "支持多层级表头、自定义样式、智能导出的Excel配置工具",
    icon: Document,
    path: "/excel-export",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    tags: [
      { text: "已上线", type: "success" },
      { text: "v1.0", type: "info" }
    ],
    status: "稳定运行"
  }
  // 后续可以添加更多工具
]);

function navigateToTool(path) {
  router.push(path);
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%);
}

.hero-section {
  position: relative;
  padding: 80px 20px 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  color: #ffffff;
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 20px 0;
  animation: fadeInDown 0.8s ease;
}

.title-icon {
  font-size: 52px;
}

.hero-subtitle {
  color: rgba(255, 255, 255, 0.95);
  font-size: 20px;
  font-weight: 300;
  margin: 0;
  animation: fadeInUp 0.8s ease 0.2s both;
}

.hero-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.circle-2 {
  width: 200px;
  height: 200px;
  top: 50%;
  right: -50px;
  animation-delay: 5s;
}

.circle-3 {
  width: 150px;
  height: 150px;
  bottom: -50px;
  left: 50%;
  animation-delay: 10s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tools-section {
  max-width: 1400px;
  margin: -40px auto 0;
  padding: 0 20px 60px;
  position: relative;
  z-index: 3;
}

.tool-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 16px;
  margin-bottom: 24px;
  animation: fadeIn 0.6s ease;
}

.tool-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.tool-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tool-icon .icon {
  font-size: 40px;
  color: #ffffff;
}

.tool-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 12px 0;
  text-align: center;
}

.tool-description {
  font-size: 14px;
  color: #7f8c8d;
  line-height: 1.6;
  margin: 0 0 16px 0;
  text-align: center;
  min-height: 44px;
}

.tool-tags {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.tool-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #ecf0f1;
}

.tool-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #27ae60;
  font-weight: 500;
}

.arrow-icon {
  font-size: 18px;
  color: #95a5a6;
  transition: transform 0.3s ease;
}

.tool-card:hover .arrow-icon {
  transform: translateX(5px);
  color: #667eea;
}

.footer-section {
  text-align: center;
  padding: 40px 20px;
  background: rgba(255, 255, 255, 0.6);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.footer-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #7f8c8d;
  font-size: 14px;
  margin: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .tools-section {
    margin-top: -20px;
  }
}
</style>
