# react-native-tuiku
用react native 做的一个推酷客户端

用的的组件：
 
* NavigatorIOS
* react-native-swiper
* ListView
* WebView
 
### 运行步骤

```shell
  1、npm install
  2、用Xcode打开tuiku.xcodeproj
  3、Commmand + R
```

界面是模仿官网的应用的，一个导航，导航下面是分类，分类下面是列表，分类可以点击切换，也可以左右滑动切换，一直往下来，会加载下一页数据，点击某一项，会进到详情页，详情页直接用一个WebView来显示，功能比较简单，共大家学习，下拉刷新也有一个开源控件，但是为了程序的简单我就没加上。

### 下面是效果

列表
<img src="https://raw.githubusercontent.com/362228416/react-native-tuiku/master/1.png"/>

详情
<img src="https://raw.githubusercontent.com/362228416/react-native-tuiku/master/2.png"/>
