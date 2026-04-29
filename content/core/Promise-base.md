promise基础

一个promise必定处于这三个状态之中
待定（pending）：初始状态，既没有被兑现，也没有被拒绝。
已兑现（fulfilled）：意味着操作成功完成。
已拒绝（rejected）：意味着操作失败。
当promise状态变化后 和他绑定的then方法将会执行，如果绑定then方法的时候promise的状态已经兑现或者拒绝 那么then将会立即调用
如果一个 Promise 已经被兑现或拒绝，即不再处于待定状态，那么则称之为已敲定（settled）。

### Promise构造函数

Promise构造函数接受一个执行器函数 这个执行器函数中可以包含一些异步操作
这个执行器函数接收两个参数 一个是resolve 一个是reject 这是两个函数
如下：

```js
const p = new Promise(exector(resolve(),reject()))
```

在执行器函数中 可以通过调用这个函数去改变promise的状态
如下：

```js
const p = new Promise ((resolve,reject)=>{
    resolve('success')
})
```

比较重要的两点：

1. executor 的完成状态对 Promise 的状态影响有限：
   executor 函数的返回值会被忽略。
   executor 函数中的 return 语句仅影响控制流程，调整函数某个部分是否执行，但不会影响 Promise 的兑现值。
   如果 executor 函数退出，且未来不可能调用 resolveFunc 或 rejectFunc（例如，没有安排异步任务），那么 Promise 将永远保持待定状态。
   如果在 executor 函数中抛出错误，则 Promise 将被拒绝，除非 resolveFunc 或 rejectFunc 已经被调用。
   这就是为什么手写promise的时候 要给执行器也包一层trycatch去捕获执行器的错误 如果出错 reject(err)
2. 在构造函数生成新的 Promise 对象时，它还会生成一对相应的 resolveFunc 和 rejectFunc 函数；它们与 Promise 对象“绑定”在一起。
   executor 是同步调用的（在构造 Promise 时立即调用），并将 resolveFunc 和 rejectFunc 函数作为传入参数。
   一旦 Promise 敲定，它会（异步地）调用任何通过 then()、catch() 或 finally() 关联的进一步处理程序。最终的兑现值或拒绝原因在调用时作为输入参数传给兑现和拒绝处理程序

#### exector的resolve()

resolve 函数有以下行为：

如果它被调用时传入了新建的 Promise 对象本身（即它所“绑定”的 Promise 对象），则 Promise 对象会被拒绝并抛出一个 TypeError 错误。
如果它使用一个非 thenable 的值（基本类型，或一个没有 then 属性或 then 属性不可调用的对象），则该 Promise 对象会被立即以该值兑现。
如果它被调用时传入了一个 thenable 对象（包括另一个 Promise 实例），则该 thenable 对象的 then 方法将被保存并在未来被调用（它总是异步调用）。
也就是说如果resolve了一个thenable或者promise

第一种情况 如果这个thenable是同步的

```js
//一个成功的例子
const p = new Promise(res => {
  res(Promise.resolve(123));
});

p.then(x => console.log(x)); // 123 因为内部那个 Promise.resolve(123) 最终成功了，所以外层的 p 也成功。

//一个失败的例子
const p = new Promise(res => {
  res(Promise.reject("err"));
});

p.catch(e => console.log(e)); // err
```

第二种情况 resolve()了一个异步的promise

```js
const inner = new Promise((res) => {
  setTimeout(() => res(42), 1000)
});

const p = new Promise(res => {
  res(inner);
});

p.then(x => console.log(x)); // 1秒后输出 42
// p 会一直 pending，直到 inner resolve。
```

❌ 错误理解（很多人这样想）
resolve(anotherPromise) 就是直接把 current Promise 结束掉。

✔ 正确理解
resolve(anotherPromise) = 把当前 Promise 的命运权交给 anotherPromise。
也就是 状态跟随（state adoption）。

---

### promise.then()

#### 概念
Promise 实例的 then() 方法最多接受两个参数：用于 Promise 兑现和拒绝情况的回调函数。它立即返回一个等效的 Promise 对象，允许你链接到其他 Promise 方法，从而实现链式调用。

```js
const promise1 = new Promise((resolve, reject) => {
  resolve("Success!");
});

const p2 = promise1.then((value) => {
  console.log(value);
  // Expected output: "Success!"
});
p2.then(x=>{
  console.log(x)//undefined
})
```

#### 语法
```js
then(onFulfilled)
then(onFulfilled, onRejected)
```

#### 参数
onFulfilled 可选
  一个在此 Promise 对象被兑现时异步执行的函数。它的返回值将成为 then() 返回的 Promise 对象的兑现值。此函数被调用时将传入以下参数：
  value
  Promise 对象的兑现值。
  如果 onFulfilled 不是一个函数，则内部会被替换为一个恒等函数（(x) => x），它只是简单地将兑现值向前传递。

onRejected 可选
  一个在此 Promise 对象被拒绝时异步执行的函数。它的返回值将成为 catch() 返回的 Promise 对象的兑现值。此函数被调用时将传入以下参数：
  reason
  Promise 对象被拒绝的原因。
  如果 onRejected 不是一个函数，则内部会被替换为一个抛出器函数（(x) => { throw x; }），它会抛出它收到的拒绝原因。

#### 返回值
立即返回一个新的 Promise 对象，该对象始终处于待定状态，无论当前 Promise 对象的状态如何。
这句话容易误解，它真正想表达的是：
then 方法在调用的瞬间返回一个新 Promise，这个新 Promise 的状态暂时是 pending，直到 then 回调执行决定它的状态。

onFulfilled 和 onRejected 处理函数之一将被执行，以处理当前 Promise 对象的兑现或拒绝。即使当前 Promise 对象已经敲定，这个调用也总是异步发生的。返回的 Promise 对象（称之为 p）的行为取决于处理函数的执行结果，遵循一组特定的规则。
  如果处理函数：

    返回一个值：p 以该返回值作为其兑现值。
    没有返回任何值：p 以 undefined 作为其兑现值。
    抛出一个错误：p 抛出的错误作为其拒绝值。
    返回一个已兑现的 Promise 对象：p 以该 Promise 的值作为其兑现值。
    返回一个已拒绝的 Promise 对象：p 以该 Promise 的值作为其拒绝值。
    返回另一个待定的 Promise 对象：p 保持待定状态，并在该 Promise 对象被兑现/拒绝后立即以该 Promise 的值作为其兑现/拒绝值。

#### 描述
then()方法用于为promise对象的完成或拒绝设置回调函数 

#### 示例
如果给一个promise注册了俩then 会按照注册顺序依次执行
按照以前的理解：
p2.then()后面的一堆放入微任务队列 第二个p2.then也放入微任务队列 然后第一个p2.then执行完了把他的then继续放入微任务队列 
所以打印的是1 1 2
```js
const p2 = new Promise((resolve, reject) => {
  resolve(1);
});

p2.then((value) => {
  console.log(value); // 1
  return value + 1;
}).then((value) => {
  console.log(value, "- A synchronous value works"); // 2 - A synchronous value works
});

p2.then((value) => {
  console.log(value); // 1
});
```

### promise.catch()
总结一下 catch只有一个回调函数 算是then的语法糖
并且如果他捕获的那个promise如果状态已经resolve了 那catch就不会执行 直接穿透到下一个then
例子：
```js
// 创建一个不会调用 onReject 的 Promise
const p1 = Promise.resolve("调用下一个");

const p2 = p1.catch((reason) => {
  // 这里永远不会执行
  console.error("p1 的 catch 函数被调用了！");
  console.error(reason);
});

p2.then(
  (value) => {
    console.log("下一个 Promise 的 onFulfilled 函数被调用了");
    console.log(value); // 调用下一个
  },
  (reason) => {
    console.log("下一个 Promise 的 onRejected 函数被调用了");
    console.log(reason);
  },
);
```

如果在resolve之后抛出了错误 catch也会忽略
例子：
```js
const p3 = new Promise((resolve, reject) => {
  resolve();
  throw new Error("Silenced Exception!");
});

p3.catch((e) => {
  console.error(e); // 这里永远不会执行
});
```

catch只能捕获他捕获的promise抛出的同步错误 
如果要捕获异步错误 就用reject()
```js
const p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    throw new Error("未捕获的异常！");
  }, 1000);
});

p2.catch((e) => {
  console.error(e); // 永远不会被调用
});
//注意：executor 中本身没有 throw → Promise 状态仍然是 pending
```
正确做法是
```js
const p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(new Error("捕获到的异常！"));
  }, 1000);
});

p2.catch((e) => {
  console.error("捕获到:", e.message); // 捕获到: 捕获到的异常！
});

```

### promise.finally()
例 1：finally 不 return 输出 finally 执行 value: 42 ✅ 原始状态和值被透传（穿透）
```js
Promise.resolve(42)
  .finally(() => {
    console.log("finally 执行");
  })
  .then(v => console.log("value:", v));

```

例 2：finally 返回普通值 输出 value: 42
```js
Promise.resolve(42)
  .finally(() => {
    return 100; // 返回值会被忽略
  })
  .then(v => console.log("value:", v));

```

例 3：finally 返回一个 Promise 输出延迟一秒 value after delay: 42 finally 会等待返回的 Promise 完成，但 不会改变原始值
```js
Promise.resolve(42)
  .finally(() => {
    return new Promise(res => setTimeout(() => res(), 1000));
  })
  .then(v => console.log("value after delay:", v));

```

例 4：finally throw 或返回 rejected 输出caught: oops in finally
```js
Promise.resolve(42)
  .finally(() => {
    throw new Error("oops in finally");
  })
  .then(v => console.log("value:", v))
  .catch(e => console.log("caught:", e.message));

```