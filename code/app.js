/**
import { Page } from './../../../../../../Demos/重构/src/core/page/page';
 * 1.描述引用计数的工作原理和优缺点
 *
 * 工作原理：
 *    在内部通过一个引用计数器来维护当前对象的引用数，
 *    来判断当前对象的引用数是否为 0 来决定她是否是一个垃圾对象，
 *    当这个数值为 0 时，GC 开始工作：将其所在的对象空间进行回收和释放再使用
 *
 * 优缺点：
 *    优点：1.发现垃圾时立即回收  2.最大限度减少程序暂停
 *    缺点：1.时间开销大
 */

/**
  * 2.描述标记整理算法的工作流程
  *
  * 标记整理可以看作是标记清除的增强操作，
  * 标记阶段的操作和标记清除是一样的，
  * 都会去遍历所有的对象，然后将当前的可达活动对象进行标记，
  * 只不过在清除阶段，
  * 标记清除是直接将没有标记的垃圾对象做空间的回收，
  * 但是标记整理会在清除之前先执行整理操作，移动对象的位置让它们能够在地址上产生连续。
  */

/**
 * 3.描述 V8 中新生代存储区垃圾回收的流程
 *
 * V8 将内存空间分成两部分，
 * 小空间用于存储新生代对象 (空间有一定大小限制：64位 操作系统是 32M 而 32位 系统是 16M)
 * 新生代指的是存活时间较短的对象
 *
 * 回收过程采用的是算法主要是：复制算法、标记整理算法，
 * 首先将新生代内存区分为两个相同大小的空间 (From：使用空间、To：空闲空间)
 * 代码在执行的过程中如果需要申请空间来使用，
 * 首先会将所有的变量对象分配至 From 空间，此时 To 是空闲着的，没有被使用，
 * 一旦 From 空间应用到一定程度之后就要触发 GC 操作，这个时候会采用标记整理算法将活动对象拷贝至 To
 * 然后 From 与 To 交换空间完成释放
 */

/**
 * 4.描述增量标记算法在何时使用及工作原理
 *
 * 使用：V8 回收老生代对象时
 *
 * 将当前一整段的垃圾回收操作拆分成多个小部分组合着去完成当前整个垃圾回收，
 * 从而去替代之前一口气做完的垃圾回收操作
 */

/**
 * 5.基于以下代码完成 4个 练习
 */
const fp = require('lodash/fp');
const cars = [
  { name: 'Ferrari FF', horsepower: 660, dollar_value: 700000, in_stock: true },
  { name: 'SpyKer C12 Zagato', horsepower: 650, dollar_value: 648000, in_stock: false },
  { name: 'Jaguar XKR-S', horsepower: 550, dollar_value: 132000, in_stock: false },
  { name: 'Audi R8', horsepower: 525, dollar_value: 114200, in_stock: false },
  { name: 'Aston Martin One-77', horsepower: 750, dollar_value: 1850000, in_stock: true },
  { name: 'PagAni HuaYra', horsepower: 700, dollar_value: 1300000, in_stock: false },
];
  /**
   * 练习1：使用函数组合 fp.flowRight() 重新实现下面这个函数
   * 题：
   */
  let isLastInStock = function (cars) {
    // 获取最后一条数据
    let last_car = fp.last(cars);
    // 获取最后一条数据的 in_stock 属性值
    return fp.props('in_stock', last_car);
  }
  /**
   * 答案：
   */
  const getLastCarInStock = fp.flowRight(fp.prop('in_stock'), fp.last);
  console.log(getLastCarInStock(cars)); // 打印 false

  /**
   * 练习2：使用 fp.flowRight()、fp.prop() 和 fp.first() 获取第一个 car 的 name
   * 答案：
   */
  const getFirstCarName = fp.flowRight(fp.prop('name'), fp.first);
  console.log(getFirstCarName(cars)); // 打印 Ferrari FF

  /**
   * 练习3：使用帮助函数 _average 重构 averageDollarValue，使用函数组合的方式实现
   * 题：
   */
  let _average = function (xs) {
    return fp.reduce(fp.add, 0, xs) / xs.length;
  } // <- 无须改动
  let averageDollarValue = function (cars) {
    let dollar_values = fp.map(function (car) {
      return car.dollar_value
    }, cars);
    return _average(dollar_values);
  }
  /**
   * 答案：
   */
  const newAverageDollarValue = fp.flowRight(_average, fp.map(car => car.dollar_value));
  console.log(newAverageDollarValue(cars)); // 打印 790700

  /**
   * 练习4：使用 flowRight 写一个 sanitizeNames() 函数，返回一个下划线链接的小写字符串，把数组中的 name 转换为这种形式：例如：sanitizeNames(["Hello World"]) => ["hello_world"]
   * 题：
   */
  let _underscore = fp.replace(/\W+/g, '_') // <-- 无须改动，并在 sanitizeNames 中使用它
  /**
   * 答案：
   */
  const sanitizeNames = fp.flowRight(fp.map(_underscore), fp.map(car => car.name));
  console.log(sanitizeNames(cars)); // 打印 ['Ferrari_FF', 'SpyKer_C12_Zagato', 'Jaguar_XKR_S', 'Audi_R8', 'Aston_Martin_One_77', 'PagAni_HuaYra']

/**
 * 6.基于下面提供的代码，完成后续的 4个 练习
 */
// support.js
class Container {
  static of (value) {
    return new Container(value);
  }
  constructor (value) {
    this._value = value;
  }
  map (fn) {
    return Container.of(fn(this._value));
  }
}
class Maybe {
  static of (x) {
    return new Maybe(x);
  }
  isNothing () {
    return this._value === null || this._value === undefined;
  }
  constructor (x) {
    this._value = x;
  }
  map (fn) {
    return this.isNothing() ? this : Maybe.of(fn(this._value));
  }
}
  /**
   * 练习1：使用 fp.add(x, y) 和 fp.map(f, x) 创建一个能让 functor 里的值增加的函数 ex1
   */
  let maybe = Maybe.of([5, 6, 1]);
  let ex1 = () => maybe.map(x => fp.map(fp.add(1), x));
  console.log(ex1()); // 打印 Maybe { _value: [ 6, 7, 2 ] }

  /**
   * 练习2：实现一个函数 ex2，能够使用 fp.first 获取列表的第一个元素
   */
  let xs = Container.of(['do', 'ray', 'me', 'fa', 'so', 'la', 'ti', 'do']);
  let ex2 = () => xs.map(x => fp.first(x));
  console.log(ex2()); // 打印 Container { _value: 'do' }

  /**
   * 练习3：实现一个函数 ex3，使用 safeProp 和 fp.first 找到 user 的名字的首字母
   */
  let safeProp = fp.curry(function (x, o) {
    return Maybe.of(o[x]);
  });
  let user = { id: 2, name: 'Albert' };
  let ex3 = () => fp.flowRight(fp.map(fp.first), safeProp('name'));
  console.log(ex3()(user)); // 打印 ['A']

  /**
   * 练习4：使用 Maybe 重写 ex4，不要有 if 语句
   */
  let ex4 = function (n) {
    if (n) {
      return parseInt(n);
    }
  }
  const newEx4 = fp.flowRight(fp.map(parseInt), Maybe.of);

/**
 * 7.手写实现 MyPromise 源码
 * 要求：尽可能还原 Promise 中的每一个 API，并通过注释的方式描述思路和原理
 * 代码：myPromise.js
 */
