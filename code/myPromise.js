/**
 * MyPromise 中三种状态常量定义
 */
const PENDING = 'pending'; // 等待
const FULFILLED = 'fulfilled'; // 成功
const REJECTED = 'rejected'; // 失败
/**
 * 定义 MyPromise 类
 */
class MyPromise {
  constructor (executor) {
    /**
     * MyPromise 接受一个执行器
     * 执行器接受两个函数：
     *    resolve：成功执行的函数
     *    reject：失败执行的函数
     */
    try {
      /**
       * 捕获执行器当中抛出的错误
       */
      executor(this.resolve, this.reject);
    } catch (e) {
      this.reject(e);
    }
  }
  /**
   * 实例属性：
   *    status : 状态，Promise 中默认为 pending 状态
   *    value : 成功的值，默认为 undefined
   *    reason : 失败的值，默认为 undefined
   */
  status = PENDING;
  value = undefined;
  reason = undefined;
  /**
   * 当在执行器函数当中放入异步函数，由于它不是立即执行，
   * 因此 then 的状态在异步函数调用前一直是 pending 所以需要判断状态是否为 pending 如果是，
   * 那么将成功和失败回调分别存入 succeedCallback 和 failCallback 当中，
   * promise 当中的 then 是可以多次调用的，因此需要使用数据分别存储，然后异步函数执行后循环调用
   */
  succeedCallback = [];
  failCallback = [];
  /**
   * resolve 和 reject 定义为箭头函数，让函数内部的 this 指向实例对象
   * 在 Promise 中有三种状态：
   *    pending：等待
   *    fulfilled：成功
   *    rejected： 失败
   * 且状态的变更只能为：
   *    pending => fulfilled
   *    pending => rejected
   * 状态一定变更就无法更改，所以在 resolve 和 reject 中首先需要判断当前状态是否为：pending，如果不是需要阻止程序向下执行：return
   */
  /**
   * @param {*} value : 成功接收的值
   */
  resolve = value => {
    if (this.status !== PENDING) return; // 判断状态，防止程序向下执行
    this.status = FULFILLED; // 更改状态为 成功：fulfilled
    this.value = value; // 保存成功之后的值
    while (this.succeedCallback.length) this.succeedCallback.shift()(); // 循环调用成功回调
  }
  /**
   * @param {*} reason : 失败接收的值
   */
  reject = reason => {
    if (this.status !== PENDING) return; // 判断状态，防止程序向下执行
    this.status = REJECTED; // 更改状态为 失败：rejected
    this.reason = reason; // 保存失败之后的值
    while (this.failCallback.length) this.failCallback.shift()(); // 循环调用失败回调
  }
  /**
   * then 方法是被定义在原型对象中的方法
   * 内部判断状态，如果状态是 fulfilled 调用成功回调函数，如果是 rejected 调用失败回调函数
   * @param {*} succeedCallback : 成功回调，接收一个参数 value，表示成功之后的值
   * @param {*} failCallback : 失败回调，接收一个参数 reason，表示失败之后的值
   */
  then (succeedCallback, failCallback) {
    /**
     * 在 Promise 中的 then 是可以链式调用的，then 当中的值应该是上一个的返回值，
     * 因此在这里返回一个新的 MyPromise，在新的 MyPromise 当中判断状态然后执行函数
     * 注意：在 Promise 当中 then 当中不能返回当前的 Promise，因此需要判断返回的是否是当前 Promise，如果是需要将错误信息传递到 reject 并抛出类型错误
     */
    /**
     * 判断 then 是否传递参数，如果没有将值传递到下一个 then 当中
     */
    succeedCallback = succeedCallback ? succeedCallback : value => value;
    failCallback = failCallback ? failCallback : reason => reason;
    const promise2 = new MyPromise((resolve, reject) => {
      // 判断状态
      if (this.status === FULFILLED) {
        /**
         * 由于 resolvePromise 函数需要比较是否是同一个 MyPromise
         * 但是由于 promise2 没有实例化，所以无法获取
         * 因此将这部分代码异步调用
         */
        setTimeout(() => {
          /**
           * 捕获成功回调当中抛出的错误
           */
          try {
            const x = succeedCallback(this.value); // 传递成功之后的值
            /**
             * 判断 x 的值是普通值还是 MyPromise 对象，
             * 如果是普通值，那么直接调用 resolve(v)
             * 如果是 MyPromise 对象，那么查看 MyPromise 对象返回结果的状态，再决定使用 resolve 还是 reject
             */
            resolvePromise(promise2, x, resolve, reject); // 调用函数判断 x 是普通值还是 MyPromise 对象
          } catch (e) {
            // 捕获到错误信息，传递到下一个 MyPromise 的回调函数
            reject(e);
          }
        }, 0);
      } else if (this.status === REJECTED) {
        setTimeout(() => {
          /**
           * 捕获失败回调当中抛出的错误
           */
          try {
            const x = failCallback(this.reason); // 传递失败之后的值
            resolvePromise(promise2, x, resolve, reject); // 调用函数判断 x 是普通值还是 MyPromise 对象
          } catch (e) {
            // 捕获到错误信息，传递到下一个 MyPromise 的回调函数
            reject(e);
          }
        }, 0);
      } else {
        // 状态为 pending 时分别将成功回调和失败回调分别存入数组，方便循环调用
        this.succeedCallback.push(() => {
          /**
           * 异步成功回调返回值判断及错误捕获
           * 同上 FULFILLED 状态时一致
           */
          setTimeout(() => {
            try {
              const x = succeedCallback(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
        this.failCallback.push(() => {
          /**
           * 异步失败回调返回值判断及错误捕获
           * 同上 REJECTED 状态一致
           */
          setTimeout(() => {
            try {
              const x = failCallback(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
      }
    });
    return promise2;
  }
  /**
   * finally : 1.不论是成功还是失败都会执行   2.在 finally 执行后依然可以调用 then，因此需要返回一个 Promise 对象
   * 调用 this.then(...) 并返回，
   * 借用 MyPromise 对象的静态 resolve 方法判断回调函数的返回值是普通值还是 MyPromise 对象，
   * 如果是普通值，resolve 会将其转换成 MyPromise 对象并返回，然后等待返回的 MyPromise 对象执行完成，
   * 如果是 MyPromise 对象，那么也会等待执行，
   * 然后在将值传递给 then
   */
  finally (callback) {
    return this.then(value => {
      return MyPromise.resolve(callback()).then(() => value);
    }, reason => {
      return MyPromise.resolve(callback()).then(() => { throw reason });
    })
  }
  /**
   * 通过 catch 处理当前 MyPromise 对象最终的状态为失败状态
   * 当调用 then 方法时可以不传递失败回调函数，如果未传递时，那么失败回调就会被 catch 捕获
   * 并且可以在 catch 后链式调用 MyPromise 对象其它方法
   */
  catch (failCallback) {
    return this.then(undefined, failCallback);
  }
  static all (arr) {
    let result = [];
    let index = 0;
    return new MyPromise((resolve, reject) => {
      function addToResult (key, value) {
        /**
         * 将成功的值添加到 result 当中
         * 由于数组当中可能包含异步执行的代码，而 for 循环时立即执行的，
         * 所以当添加值的时候异步代码尚未执行，
         * 那么异步代码的值此时可能还没有添加到 result，这样的话 then 当中获取的值就会有缺少，
         * 所以要判断已添加的值的长度是否等于 arr 的长度，
         * 只有当两者相等时执行 resolve 传递 result 到 then 当中去
         */
        result[key] = value;
        index++;
        if (index === arr.length) resolve(result);
      }
      /**
       * 循环传入的数组，
       * 判断当前是 MyPromise 对象还是普通值
       */
      for (let i = 0; i < arr.length; i++) {
        let current = arr[i];
        if (current instanceof MyPromise) {
          // MyPromise 对象
          current.then(value => addToResult(i, value), reject);
        } else {
          // 普通值
          addToResult(i, current);
        }
      }
    });
  }
  /**
   * 判断 resolve 传递的值是 MyPromise 对象还是普通值
   */
  static resolve (value) {
    if (value instanceof MyPromise) return value;
    return new MyPromise(resolve => resolve(value));
  }
}

function resolvePromise (promise2, x, resolve, reject) {
  /**
   * 判断返回的 MyPromise 对象是否是自身
   */
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise #<MyPromise>'));
  }
  if (x instanceof MyPromise) {
    // MyPromise 对象
    x.then(resolve, reject);
  } else {
    // 普通值
    resolve(x);
  }
}

module.exports = MyPromise;