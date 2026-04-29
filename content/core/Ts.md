# 1.常用类型

## 1.1类型注解

示例代码：

```jsx
let age:number = 18
```

说明：代码中的number就是类型注解

作用：为变量添加类型约束 比如：上述代码中 约定变量为age的类型为number（数值类型）

解释：约定了什么类型 就只能给变量赋值该类型的值 



## 1.2常用基础类型概述

可以将TS中的常用基础类型细分为两类:1 JS已有类型 2TS新增类型

1. JS已有类型

- 原始类型：number/string/boolean/null/undefined/symbol
- 对象类型：object（数组、对象、函数等）

1. TS新增类型

- 联合类型、自定义类型（类型别名）、接口、元组、字面量类型、枚举、void、any等

## 1.3Ts常用类型

对象类型：object（包括数组 对象 函数等对象）

特点：对象类型 在TS中更加细化 每个具体的对象都有自己的类型语法

- 数组类型的两种写法：（推荐使用number[]写法）

```jsx
let number:number[]=[1,2,3]
let strings:Array<string>=['a','b','c']
```

需求：数组中既有number类型 又有string类型 这个数组的类型应该如何写？

```jsx
let arr：(number|string)[]=[1,'a',3]//联合类型  
```

解释： | （竖线）在TS中叫做联合类型（由两个或者多个其他类型组成的类型 表示可以是这些类型中的任意一种

注意：这是TS种联合类型的写法 只有一根竖线 不要和JS中的（||）混淆了



## 1.4类型别名

类型别名（自定义类型）：为任意类型写别名

使用场景：当同一类型（复杂）被多次使用时 可以通过类型别名 简化该类型的使用

```jsx
type CustomArray = (number | string)[]
let arr1:CustomArray = [1,'1',2]
let arr2:CustomArray=['x',1,'t']
```

解释：

1.使用type关键字来创建类型别名

2.类型别名可以是任意合法的变量名称

3.创建类型别名后 直接使用该类型别名作为变量的类型注解即可



## 1.5函数类型

函数的类型实际上指的是：函数参数和返回值的类型

为函数指定类型的两种方式：1 单独指定参数 返回值的类型 2 同时指定参数和返回值的类型

1. 单独指定参数、返回值的类型：

```typescript
function add(num1:number,num2:number):number{
  return num1+num2
}

const add = (num1:number,num2:number):number=>{
  return num1+num2
}
```

2. 同时指定参数、返回值的类型：

```typescript
const add:(num1:number,num2:number)=>number = (num1,num2)=>{
  return num1+num2
}
```

如果函数没有返回值 那么返回类型为void

```js
function greet(name:string):void{
    console.log('hello'+name)
}
```

使用函数实现某个功能时 参数可以传也可以不传 这种情况下 在给函数参数指定类型时 就用到可选参数了 比如 数组的slice方法 可以slice（）也可以slice（1）

```js
function mySlice(start?:number,end?:number):void{
    console.log('起始索引：'+start,'结束索引：'+end)
}
```



可选参数：在可传可不传的参数名称后面添加？(问号)

注意：可选参数只能出现在参数列表的最后 也就是说可选参数后面不能再出现必选参数 

## 1.6对象类型

JS的对象是由属性和方法构成的 而TS中对象的类型就是在描述对象的结构（有什么类型的属性和方法）

对象类型的写法：

```js
let person:{name:string; age:number;sayHi():void}={
    name:'jack',
    age:19,
    sayHi(){}
}
```

对象的属性或方法 也可以是可选的 此时就用到可选属性了

比如 我们在使用axios时 如果是发送get请求 method属性就可以省略

```js
function myAxios(config:{url:string; method?:string}){
    console.log(config)
}
```

可选属性的语法与函数可选参数的语法一致 都是用？来表示

## 1.7接口

当一个对象类型被多次使用时 一般会使用接口（interface）来描述对象的类型 达到复用的目的

解释：

1.使用interface关键字来声明接口

2.接口名称（比如，此处的IPerson），可以是任意合法的变量名称

3.声明接口后 直接使用接口名称作为变量的类型

4.因为每一行只有一个属性类型 因此 属性类型后面没有分号

```ts
interface IPerson{
    name:string
    age:number
    sayHi():void
}

let person:IPerson = {
    name:'jack',
    age:19,
    sayHi(){}
}
```

**接口和类型别名的对比**

* 相同点：都可以给对象指定类型
* 不同点：
  * 接口：只能为对象和类指定类型
  * 类型别名：可以为任意类型指定别名

**接口的继承**

![TypeScript 接口继承](/assets/19.png)



## 1.8元组

场景：在地图中 使用经纬度坐标来标记位置信息

可以使用数组来记录坐标 那么 该数组中只有两个元素 并且这两个元素都是数值类型

```typescript
let position:number[]=[1,2]//定义一个类型为number的数组开存储经纬度
```

使用number[]的缺点： 不严谨 因为该类型的数组中可以出现任意多个数字

更好的方式：元组(Tuple)

元组类型是另一种类型的数组 他确切的知道包含多少个元素 以及特定索引对应的类型

```typescript
let position:[number,number]= [1,2] //可以是两个也可以是多个 但是是定义的时候就确定的
```

解释：

1. 元组类型可以确切的标记处有多少个元素 以及每个元素的类型
2. 示例中 元组有两个元素 每个元素的类型都是number



## 1.9类型推论

在TS中 某些没有明确指出类型的地方 Ts的类型推论机制会帮助提供类型

换句话说 由于类型推论的存在 这些地方 类型注解可以省略不写

发生类型推论的两种常见场景 ：1. 声明变量并初始化时 2. 决定函数返回值时

![TypeScript 类型推论示例](/assets/20.png)

注意：这两种情况下类型注解可以省略不写

推荐：能省略类型注解的地方就省略

技巧：如果不知道类型 可以鼠标放在变量名称上

---

## 2.1类型断言

使用类型断言：

```typescript
const aLink = document.getElementById('link') as HTMLAnchorElement
```

解释：

1. 使用as关键字实现类型断言
2. 关键字as后面的类型是一个更加具体的类型（HTMLAnchorElement是HTMLElement的子类型）
3. 通过类型断言 aLink的类型变得更加具体 这样就可以访问a标签特有的属性或者方法了
4. **意思就是不用as类型断言访问不到a标签的特殊属性href 加了断言相当于更精确 就能访问到**

另一种语法：使用<>语法 不常用

```ts
const aLink = <HTMLAnchorElement>ducument.getElementById('Link')
```

## 2.2字面量类型

![TypeScript 类型推论示例](/assets/21.png)![TypeScript 类型推论示例](/assets/22.png)



## 2.3枚举

![TypeScript 类型推论示例](/assets/24.png)

**访问枚举成员**

![TypeScript 类型推论示例](/assets/25.png)

![TypeScript 类型推论示例](/assets/26.png)

**字符串枚举**

![TypeScript 类型推论示例](/assets/27.png)



**枚举的实现原理 （枚举编译成js干了什么）**

![TypeScript 类型推论示例](/assets/28.png)

意思就是枚举编译成js其实就是编译成了一个对象 这个对象的成员是枚举的属性 值就是枚举的值 Direction是一个对象 传入一个对象 给这个对象的各个属性赋值

## 2.4 any类型

![TypeScript 类型推论示例](/assets/29.png)

## 2.5 typeof

![TypeScript 类型推论示例](/assets/30.png)

# 3.Ts高级

## 3.1class类

![TypeScript 类型推论示例](/assets/31.png)

![TypeScript 类型推论示例](/assets/32.png)

## 3.2类型兼容性

![TypeScript 类型推论示例](/assets/33.png)

![TypeScript 类型推论示例](/assets/34.png)![TypeScript 类型推论示例](/assets/35.png)

## 3.3 交叉类型

![TypeScript 类型推论示例](/assets/36.png)

交叉类型和接口继承的对比

![TypeScript 类型推论示例](/assets/37.png)

## 3.4 泛型



![TypeScript 类型推论示例](/assets/38.png)

泛型的创建

![TypeScript 类型推论示例](/assets/39.png)

泛型的调用

![TypeScript 类型推论示例](/assets/40.png)

简化调用函数参数

![TypeScript 类型推论示例](/assets/41.png)

泛型约束

![TypeScript 类型推论示例](/assets/42.png)



![TypeScript 类型推论示例](/assets/43.png)

泛型接口：接口中使用泛型

![TypeScript 类型推论示例](/assets/44.png)

创建泛型类

![TypeScript 类型推论示例](/assets/45.png)  

泛型工具类型：就是接口中有的属性可以加问号 代表可选 加上Partial可以把所有属性设置为可选

![TypeScript 类型推论示例](/assets/46.png)

![TypeScript 泛型约束](/assets/50.png)

![TypeScript 类型推论示例](/assets/51.png)

## 3.5索引签名类型

![TypeScript 类型推论示例](/assets/52.png)

## 3.6映射类型

![TypeScript 类型推论示例](/assets/53.png)

![TypeScript 类型推论示例](/assets/54.png)

索引查询类型

![TypeScript 类型推论示例](/assets/55.png)



## 4.类型声明文件

概述：
![TypeScript 类型推论示例](/assets/56.png)

## 4.1 TS中两种不同的文件类型

![TypeScript 类型推论示例](/assets/57.png)

## 4.2类型声明文件的使用说明

![TypeScript 类型推论示例](/assets/58.png)

![TypeScript 类型推论示例](/assets/59.png)

![TypeScript 类型推论示例](/assets/60.png)