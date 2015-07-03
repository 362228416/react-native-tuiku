var React = require('react-native');
var {
  StyleSheet,
  NavigatorIOS,
  ListView,
  TouchableOpacity,
  WebView,
  ActivityIndicatorIOS,
  Text,
  View,
  Image,
  Text
} = React;

var Swiper = require('react-native-swiper')
var Dimensions = require('Dimensions');
var {width, height} = Dimensions.get('window');
var contentHeight = height - 40;

// htmlparser will check runtime
global.__filename = global.__filename ? global.__filename : '';
global.__dirname = global.__dirname ? global.__dirname : '';
var htmlparser = require("htmlparser");

var Home = React.createClass({
  getInitialState() {
    return {
      active: 0,
      group: [
        {id: 0, name: '热门', path: 'ah/0', dataSource: new ListView.DataSource({rowHasChanged: (r1,r2) => r1 !== r2}).cloneWithRows([])},
        {id: 1, name: '科技', path: 'ah/101000000', dataSource: new ListView.DataSource({rowHasChanged: (r1,r2) => r1 !== r2}).cloneWithRows([])},
        {id: 2, name: '创投', path: 'ah/101040000', dataSource: new ListView.DataSource({rowHasChanged: (r1,r2) => r1 !== r2}).cloneWithRows([])},
        {id: 3, name: '数码', path: 'ah/101050000', dataSource: new ListView.DataSource({rowHasChanged: (r1,r2) => r1 !== r2}).cloneWithRows([])},
        {id: 4, name: '技术', path: 'ah/20', dataSource: new ListView.DataSource({rowHasChanged: (r1,r2) => r1 !== r2}).cloneWithRows([])},
        {id: 5, name: '设计', path: 'ah/108000000', dataSource: new ListView.DataSource({rowHasChanged: (r1,r2) => r1 !== r2}).cloneWithRows([])},
        {id: 6, name: '营销', path: 'ah/114000000', dataSource: new ListView.DataSource({rowHasChanged: (r1,r2) => r1 !== r2}).cloneWithRows([])}
      ]
    }
  },

  parserRow(row) {
    var title, href, image, content;
    if ('article_thumb' == row.children[1].children[3].attribs['class']) {
      if (row.children[1].children[1].children[1].children[1].attribs.title) {
        title = row.children[1].children[1].children[1].children[1].attribs.title;
        href = row.children[1].children[1].children[1].children[1].attribs.href;
      } else {
        title = row.children[1].children[1].children[1].children[3].attribs.title;
        href = row.children[1].children[1].children[1].children[3].attribs.href;
      }
      image = row.children[1].children[3].children[1].attribs.src;
      content = row.children[1].children[1].children[3].children[0].data.replace(/(^\s*)|(\s*$)/g,'');
    } else {
      if (row.children[1].children[1].children[1].attribs.title) {
        title = row.children[1].children[1].children[1].attribs.title;
        href = row.children[1].children[1].children[1].attribs.href;
      } else {
        title = row.children[1].children[1].children[3].attribs.title;
        href = row.children[1].children[1].children[3].attribs.href;
      }
      content = row.children[1].children[3].children[0].data.replace(/(^\s*)|(\s*$)/g,'');
    }
    return {title: title, href: href, image: image, content: content}
  },

  getGroup() {
    return this.state.group[this.state.active];
  },

  loadData(update) {
    var group = this.getGroup();
    if (group.loaded && !update) return;
    var page = group.page ? group.page++ : 0;
    var url = 'http://www.tuicool.com/' + group.path + '/' + page++ + '?lang=1';
    fetch(url)
      .then(res => res.text())
      .then(html => {
        var handler = new htmlparser.DefaultHandler();
        var parser = new htmlparser.Parser(handler);
        parser.parseComplete(html);
        console.log(handler.dom);
        var list = handler.dom[6].children[5].children[1].children[1].children[7];
        var rows = [];
        for (var i = 1; i < list.children.length; i+=2) {
          var row = list.children[i];
          rows.push(this.parserRow(row));
        }
        var data = group.data ? group.data.concat(rows) : rows;
        group.dataSource = group.dataSource.cloneWithRows(data);
        group.loaded = true;
        group.page = page;
        group.data = data;
        this.setState({group: this.state.group});
      });
  },

  pullUp() {
    this.loadData(true);
  },

  componentDidMount() {
    this.loadData();
  },

  onMomentumScrollEnd(e, state, context) {
    this.setState({active: state.index});
    this.loadData();
  },

  typePress(row) {
    this.refs.swiper.scrollTo(row.id - this.state.active);
  },

  gotoDetail(row) {
    var url = 'http://www.tuicool.com/' + row.href;
    this.props.navigator.push({
      title: row.title,
      component: TuikuDetail,
      passProps: {
        url: url
      }
    })
  },

  renderRow(row, t, i) {
    return (
      <TouchableOpacity key={i} onPress={() => this.gotoDetail(row)}>
        <View>
          <View style={styles.rowContainer}>
            <View style={styles.textContainer}>
              {row.title ? <Text style={styles.title}>{row.title}</Text> : <View/>}
              <Text style={styles.address}>{row.content}</Text>
            </View>
            {row.image ? <Image style={styles.thumb} source={{uri: row.image}}/> : <View/>}
          </View>
          <View style={styles.separator}/>
        </View>
      </TouchableOpacity>
    )
  },

  render() {
    var group = [], contents = [];
    this.state.group.map(function(row){
      group.push(
        <TouchableOpacity onPress={this.typePress.bind(this, row)}>
          <View style={styles.typeText}><Text style={this.state.active == row.id ? styles.typeActive : null}>{row.name}</Text></View>
        </TouchableOpacity>
      );

      if (this.state.active == row.id && this.getGroup().loaded) {
        contents.push(
          <View style={{height: contentHeight, marginTop: -60}}>
            <ListView
              dataSource={this.getGroup().dataSource}
              renderRow={this.renderRow}
              onEndReached={this.pullUp}
            />
          </View>
        );
      } else {
        contents.push(<ActivityIndicatorIOS animating={true} size="large" style={{marginTop: 20}}/>);
      }
    }.bind(this));

    return (
      <View style={{paddingTop: 68, flex: 1}}>
        <View style={[styles.flex, styles.typeRow]}>
          {group}
        </View>
        <View style={styles.separator}/>
        <Swiper ref="swiper" autoplay={false} onMomentumScrollEnd={this.onMomentumScrollEnd}>
          {contents}
        </Swiper>
      </View>
    )
  }
})

var TuikuDetail = React.createClass({
  render() {
    return (
      <WebView
          automaticallyAdjustContentInsets={false}
          url={this.props.url}
          javaScriptEnabledAndroid={true}
          startInLoadingState={true}
        />
    )
  }
})

var Tuiku = React.createClass({
  render() {
    return (
      <NavigatorIOS
        style={{flex: 1}}
        initialRoute={{
          title: '推酷',
          component: Home
      }}/>
    )
  }
})

var styles = StyleSheet.create({
  flex: {flexDirection: 'row'},
  typeRow: {padding: 8},
  typeActive: {color: 'blue'},
  typeText: {flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'},

  rowContainer: {
      flex: 1,
      flexDirection: 'row',
      padding: 10,
      marginBottom: 8,
  },
  textContainer: {
      flex: 2,
      paddingRight: 10
  },
  title: {
      fontSize: 15,
      fontWeight: 'bold',
      color: '#48BBEC',
      marginBottom: 8
  },
  address: {
      fontSize: 13,
      color: '#656565',
      lineHeight: 18,
  },
  thumb: {
      width: 80,
      height: 80,
      marginRight: 10,
      flex: 1
  },
  separator: {
      height: 1,
      backgroundColor: '#dddddd'
  },
});

module.exports = Tuiku;
