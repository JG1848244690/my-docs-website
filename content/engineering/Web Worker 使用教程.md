# Web Worker 使用教程 - 文件切片上传优化

##  目录

1. [什么是 Web Worker？](#什么是-web-worker)
2. [为什么需要两个文件？](#为什么需要两个文件)
3. [文件结构说明](#文件结构说明)
4. [Web Worker 工作原理](#web-worker-工作原理)
5. [主线程与 Worker 通信](#主线程与-worker-通信)
6. [完整代码解析](#完整代码解析)
7. [使用示例](#使用示例)
8. [常见问题](#常见问题)

---

## 什么是 Web Worker？

### 基本概念

**Web Worker** 是浏览器提供的多线程技术，允许在后台线程中运行 JavaScript 代码，而不会阻塞主线程（UI 线程）。

### 为什么需要 Web Worker？

**问题场景**：
```javascript
//  主线程中的耗时操作会阻塞 UI
function processLargeFile(file) {
  // 这个操作可能需要 3-5 秒
  const hash = calculateHash(file);  // 页面卡顿！
  const chunks = sliceFile(file);    // 页面无响应！
  return chunks;
}
```

**使用 Worker 后**：
```javascript
//  Worker 在后台处理
const worker = new Worker('worker.js');
worker.postMessage({ file });
// 主线程继续运行，页面不卡顿！
```

### 浏览器支持

-  Chrome 4+
-  Firefox 3.5+
-  Safari 4+
-  Edge 12+
-  所有现代浏览器

---

## 为什么需要两个文件？

### 文件职责分离

#### 1. `chunk-uploader.worker.ts` - Worker 代码（参考实现）

**作用**：定义 Worker 内部要执行的代码逻辑

**特点**：
- 运行在**独立的线程**中
- 不能访问 DOM、window 对象
- 只能通过 `postMessage` 与主线程通信
- 适合处理 CPU 密集型任务

**为什么单独一个文件？**
- 代码清晰，职责单一
- 方便测试和维护
- 可以作为参考实现

#### 2. `chunk-uploader-with-worker.ts` - 主线程代码

**作用**：在主线程中创建和管理 Worker，处理业务逻辑

**特点**：
- 运行在**主线程**
- 可以访问 DOM、操作 UI
- 负责创建 Worker、发送消息、接收结果
- 处理文件上传、进度更新等

### 实际实现方式

**注意**：在实际代码中，我们使用了**内联 Worker**（将 Worker 代码作为字符串），而不是单独的文件。这样做的好处是：

1.  避免路径问题（Next.js 打包后路径可能变化）
2.  不需要额外的 webpack 配置
3.  代码更集中

但 `chunk-uploader.worker.ts` 仍然有用：
-  作为参考实现，展示 Worker 代码结构
-  可以单独测试 Worker 逻辑
-  文档和代码审查

---

## 文件结构说明

```
web-front/src/lib/
├── chunk-uploader.ts              # 原始上传器（主线程版本）
├── chunk-uploader.worker.ts       # Worker 代码（参考实现）
└── chunk-uploader-with-worker.ts  # 使用 Worker 的上传器（主线程代码）
```

### 文件对比

| 文件 | 运行位置 | 主要职责 | 可访问的资源 |
|------|---------|---------|------------|
| `chunk-uploader.ts` | 主线程 | 文件切片、上传 | DOM、window、所有 API |
| `chunk-uploader.worker.ts` | Worker 线程 | 文件切片、哈希计算 | 有限的 API（无 DOM） |
| `chunk-uploader-with-worker.ts` | 主线程 | 创建 Worker、管理通信 | DOM、window、所有 API |

---

## Web Worker 工作原理

### 架构图

```
┌─────────────────────────────────────────────────┐
│              浏览器主线程（UI 线程）              │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  chunk-uploader-with-worker.ts          │  │
│  │  - 创建 Worker                           │  │
│  │  - 发送消息 (postMessage)                │  │
│  │  - 接收消息 (onmessage)                  │  │
│  │  - 更新 UI                                │  │
│  └──────────────────────────────────────────┘  │
│                    ↕ 消息传递                     │
└─────────────────────────────────────────────────┘
                    ↕ postMessage
┌─────────────────────────────────────────────────┐
│            Web Worker 线程（后台线程）           │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  chunk-uploader.worker.ts                │  │
│  │  - 接收消息 (onmessage)                  │  │
│  │  - 处理文件切片                           │  │
│  │  - 计算文件哈希                           │  │
│  │  - 发送结果 (postMessage)                 │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 线程隔离

**主线程**：
-  可以操作 DOM
-  可以访问 window 对象
-  可以调用所有浏览器 API
-  不能直接访问 Worker 内部变量

**Worker 线程**：
-  可以执行耗时计算
-  可以处理大文件
-  不能访问 DOM
-  不能访问 window 对象
-  只能通过消息与主线程通信

---

## 主线程与 Worker 通信

### 通信方式：消息传递（Message Passing）

#### 1. 主线程 → Worker（发送消息）

```typescript
// 主线程代码
const worker = new Worker(workerUrl);

// 发送消息给 Worker
worker.postMessage({
  type: 'slice',
  file: myFile,
  chunkIndex: 0,
  start: 0,
  end: 1024 * 1024,
});
```

#### 2. Worker → 主线程（接收消息）

```typescript
// Worker 代码
self.onmessage = (e: MessageEvent) => {
  const { type, file, chunkIndex, start, end } = e.data;
  
  // 处理任务
  const chunk = file.slice(start, end);
  
  // 发送结果回主线程
  self.postMessage({
    type: 'chunk-ready',
    chunkIndex,
    chunk,
  });
};
```

#### 3. 主线程接收 Worker 的响应

```typescript
// 主线程代码
worker.onmessage = (e: MessageEvent) => {
  const { type, chunkIndex, chunk } = e.data;
  
  if (type === 'chunk-ready') {
    console.log(`切片 ${chunkIndex} 准备完成`);
    // 使用 chunk 进行上传
  }
};
```

### 消息传递的特点

1. **异步通信**：消息传递是异步的，不会阻塞
2. **数据克隆**：传递的数据会被克隆（structured clone）
3. **类型限制**：不能传递函数、DOM 节点等
4. **File 对象**：File 对象可以通过 structured clone 传递 

---

## 完整代码解析

### 1. Worker 代码 (`chunk-uploader.worker.ts`)

```typescript
// 这个文件定义了 Worker 内部要执行的逻辑

// 定义消息类型
export interface ChunkWorkerMessage {
  type: 'slice' | 'hash' | 'abort';
  file?: File;
  chunkIndex?: number;
  start?: number;
  end?: number;
}

export interface ChunkWorkerResponse {
  type: 'chunk-ready' | 'hash-ready' | 'error';
  chunkIndex?: number;
  chunk?: Blob;
  hash?: string;
  error?: string;
}

// 监听主线程发送的消息
self.onmessage = async (e: MessageEvent<ChunkWorkerMessage>) => {
  const { type, file, chunkIndex, start, end } = e.data;

  try {
    switch (type) {
      case 'slice': {
        // 在 Worker 中切片文件
        const chunk = file.slice(start, end);
        
        // 发送结果回主线程
        self.postMessage({
          type: 'chunk-ready',
          chunkIndex,
          chunk,
        });
        break;
      }

      case 'hash': {
        // 生成文件哈希（耗时操作）
        const hash = await generateFileHash(file);
        
        self.postMessage({
          type: 'hash-ready',
          hash,
        });
        break;
      }
    }
  } catch (error) {
    // 发送错误信息
    self.postMessage({
      type: 'error',
      error: error.message,
    });
  }
};

// Worker 中的辅助函数
async function generateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  // ... 转换为十六进制字符串
  return hash;
}
```

**关键点**：
- `self.onmessage`：监听主线程消息
- `self.postMessage`：发送消息给主线程
- `self.close()`：终止 Worker

### 2. 主线程代码 (`chunk-uploader-with-worker.ts`)

#### 创建 Worker

```typescript
export class ChunkUploaderWithWorker {
  private worker: Worker | null = null;

  // 创建内联 Worker（将代码作为字符串）
  private createWorker(): Worker {
    const workerCode = `
      // Worker 代码（字符串形式）
      self.onmessage = async function(e) {
        // ... Worker 逻辑
      };
    `;

    // 将字符串转换为 Blob
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    
    // 创建 Worker
    return new Worker(workerUrl);
  }
}
```

#### 与 Worker 通信

```typescript
// 在 Worker 中生成文件哈希
private async generateFileHashWithWorker(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // 创建 Worker（如果还没有）
    if (!this.worker) {
      this.worker = this.createWorker();
    }

    // 设置超时
    const timeout = setTimeout(() => {
      reject(new Error('Hash generation timeout'));
    }, 30000);

    // 监听 Worker 的响应
    const handleMessage = (e: MessageEvent<ChunkWorkerResponse>) => {
      if (e.data.type === 'hash-ready') {
        clearTimeout(timeout);
        this.worker?.removeEventListener('message', handleMessage);
        resolve(e.data.hash!);  // 返回哈希值
      } else if (e.data.type === 'error') {
        clearTimeout(timeout);
        this.worker?.removeEventListener('message', handleMessage);
        reject(new Error(e.data.error));
      }
    };

    // 注册消息监听器
    this.worker.addEventListener('message', handleMessage);
    
    // 发送消息给 Worker
    this.worker.postMessage({
      type: 'hash',
      file,
    });
  });
}
```

#### 使用 Worker 切片文件

```typescript
// 在 Worker 中切片文件
private async sliceChunkWithWorker(
  file: File,
  chunkIndex: number,
  start: number,
  end: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!this.worker) {
      this.worker = this.createWorker();
    }

    const handleMessage = (e: MessageEvent<ChunkWorkerResponse>) => {
      // 检查是否是我们要的切片
      if (e.data.type === 'chunk-ready' && e.data.chunkIndex === chunkIndex) {
        this.worker?.removeEventListener('message', handleMessage);
        resolve(e.data.chunk!);  // 返回切片
      } else if (e.data.type === 'error') {
        this.worker?.removeEventListener('message', handleMessage);
        reject(new Error(e.data.error));
      }
    };

    this.worker.addEventListener('message', handleMessage);
    
    // 发送切片任务
    this.worker.postMessage({
      type: 'slice',
      file,
      chunkIndex,
      start,
      end,
    });
  });
}
```

#### 清理 Worker

```typescript
private cleanupWorker() {
  if (this.worker) {
    try {
      // 发送终止消息
      this.worker.postMessage({ type: 'abort' });
    } catch (e) {
      // Worker 可能已经关闭
    }
    // 终止 Worker
    this.worker.terminate();
    this.worker = null;
  }
}
```

---

## 使用示例

### 基础使用

```typescript
import { ChunkUploaderWithWorker } from '@/lib/chunk-uploader-with-worker';

// 创建上传器（启用 Worker）
const uploader = new ChunkUploaderWithWorker(1 * 1024 * 1024, true);

// 上传文件
await uploader.upload({
  file: selectedFile,
  title: "我的视频",
  useWorker: true,  // 使用 Worker
  onProgress: (percent) => {
    console.log(`进度: ${percent}%`);
  },
});
```

### 完整流程示例

```typescript
async function handleUpload() {
  const file = document.querySelector('input[type="file"]').files[0];
  
  // 1. 创建上传器
  const uploader = new ChunkUploaderWithWorker(1 * 1024 * 1024, true);
  
  try {
    // 2. 开始上传（内部会使用 Worker）
    await uploader.upload({
      file,
      title: "测试视频",
      useWorker: true,
      onProgress: (percent) => {
        // 3. 更新进度条（主线程）
        updateProgressBar(percent);
      },
    });
    
    console.log('上传成功！');
  } catch (error) {
    console.error('上传失败:', error);
  }
}
```

### 执行流程

```
1. 用户选择文件
   ↓
2. 主线程：创建 ChunkUploaderWithWorker
   ↓
3. 主线程：调用 upload()
   ↓
4. 主线程：创建 Worker（createWorker）
   ↓
5. 主线程 → Worker：发送 'hash' 消息
   ↓
6. Worker：计算文件哈希（耗时操作，不阻塞主线程）
   ↓
7. Worker → 主线程：发送 'hash-ready' 消息
   ↓
8. 主线程：接收哈希值
   ↓
9. 主线程 → Worker：发送多个 'slice' 消息（并行）
   ↓
10. Worker：切片文件（不阻塞主线程）
    ↓
11. Worker → 主线程：发送 'chunk-ready' 消息
    ↓
12. 主线程：接收切片，上传到服务器
    ↓
13. 主线程：更新进度条（UI 更新）
    ↓
14. 完成！
```

---

## 常见问题

### Q1: 为什么需要两个文件？

**A**: 
- `chunk-uploader.worker.ts`：定义 Worker 内部逻辑（参考实现）
- `chunk-uploader-with-worker.ts`：主线程代码，管理 Worker 和业务逻辑

实际上我们使用内联 Worker（代码作为字符串），但分离文件有助于：
- 代码清晰
- 便于测试
- 文档说明

### Q2: Worker 可以访问 DOM 吗？

**A**:  不可以。Worker 运行在独立线程，无法访问：
- DOM 元素
- window 对象
- document 对象
- 某些浏览器 API

### Q3: 可以传递函数给 Worker 吗？

**A**:  不可以。只能传递可序列化的数据：
-  基本类型（string, number, boolean）
-  对象、数组
-  File、Blob、ArrayBuffer
-  函数、DOM 节点、Symbol

### Q4: Worker 会消耗很多内存吗？

**A**: 会，但可控：
- 每个 Worker 大约占用 1-2MB 内存
- 处理大文件时会占用更多（文件数据）
- 使用完后记得 `terminate()` 释放资源

### Q5: 什么时候使用 Worker？

**A**: 适合的场景：
-  CPU 密集型任务（计算、加密）
-  大文件处理（切片、哈希）
-  长时间运行的任务

不适合的场景：
-  简单操作（开销大于收益）
-  需要频繁访问 DOM
-  小文件处理（<5MB）

### Q6: 如何调试 Worker？

**A**: 
1. 在 Worker 代码中使用 `console.log`
2. 在 Chrome DevTools 的 Sources 中查看 Worker 线程
3. 使用 `debugger` 语句

### Q7: Worker 可以共享数据吗？

**A**: 不能直接共享，但可以通过：
- `postMessage` 传递数据（会克隆）
- `SharedArrayBuffer`（需要特殊配置，不常用）

### Q8: 可以创建多个 Worker 吗？

**A**:  可以！可以创建多个 Worker 并行处理：

```typescript
// 创建多个 Worker 并行处理
const workers = Array(4).fill(0).map(() => new Worker(workerUrl));

// 分配任务给不同的 Worker
workers.forEach((worker, index) => {
  worker.postMessage({ task: index });
});
```

---

## 总结

### 核心概念

1. **Web Worker** = 后台线程，不阻塞主线程
2. **消息传递** = Worker 与主线程的唯一通信方式
3. **线程隔离** = Worker 不能访问 DOM
4. **数据克隆** = 传递的数据会被复制

### 使用场景

 **适合**：
- 大文件处理
- 复杂计算
- 需要保持 UI 流畅的场景

 **不适合**：
- 简单操作
- 需要频繁访问 DOM
- 小文件处理

### 最佳实践

1.  及时清理 Worker（`terminate()`）
2.  处理错误和超时
3.  提供降级方案（不支持 Worker 时）
4.  控制 Worker 数量（避免内存溢出）

---

**文档版本**：v1.0  
**最后更新**：2025-01-15  
**作者**：HLS Edu Team

