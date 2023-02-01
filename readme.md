machine

# jc-marked

Markdown AST (Abstract syntax tree) parser based on finite-state machine (FSM).

By using this module, it can be used to extend the functions of the existing Markdown parser. You can also continue to develop on the basis of this module and complete the functions of the existing Markdown parser yourself.

## Additional grammar

| grammar      | describe                              | explain                                                      |
| ------------ | :------------------------------------ | ------------------------------------------------------------ |
| `#title`   | Define the title of the article.      | Can be used to automatically generate article information.   |
| `##title ` | Define article subtitle.              | Can be used to automatically generate article information.   |
| `#author ` | Define the author information.        | Including the author's name, email address and home page     |
| `#last `   | Name and address of the last article. | It can be used in different articles in the same collection. |
| `#next `   | Name and address of the next article. | It can be used in different articles in the same collection. |
| `#summary` | An overview of the article.           | Can be used to automatically generate article information.   |

### example for `#title`

```
#title Vue 从入门到精通
```

### example for `##title`

```
##title 组件常见的数据访问方式总结
```

### example for `#author`

```
#author "Jack Lee" "291148484@163.com" "https://blog.csdn.net/qq_28550263?spm=1001.2101.3001.5343"
```

### example for `#last`

```
#last [《上一篇文章》](http://www.baidu.com)
```

### example for `#next`

```
#next [《下一篇文章》](http://www.qq.com)
```

### example for `#summary`

```
#summary 本文介绍 Vue3 组件常见的数据访问方式
```

## Installation dependency

```
npm install
# or
yarn
# or
pnpm install
```

## run state machine

```
npm run dev
# or
yarn dev
# or
pnpm run dev
```
