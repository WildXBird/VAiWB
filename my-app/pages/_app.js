import React, { PureComponent } from 'react';
import Script from 'react-load-script';

import '../styles/globals.css'

class MyApp extends PureComponent {
  constructor(props) {
    super(props)
    this.ref = React.createRef();
    this.ref_mobile = React.createRef();
    this.anchorRef = React.createRef();
    this.state = {
    }
  }
  componentDidMount() {
    let Fthis = this
    this.setState({
      ready: true,
    })

    if (!!!document.getElementById('antd-css-v4-import')) {
      let head = document.head
      let link = document.createElement("link")
      link.id = 'antd-css-v4-import'
      link.rel = "stylesheet"
      link.type = "text/css"
      link.href = 'https://cdn.jsdelivr.net/npm/antd@4.15.1/dist/antd.min.css';
      head.appendChild(link)
    }
    this.loadJS = function (url) {
      let xhr = new XMLHttpRequest()
      xhr.open("GET", url, false)
      xhr.send()
      window.eval(xhr.responseText)
    }
  }
  render() {
    let Fthis = this
    if (this.state.ready) {
      this.loadJS("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.js")
      this.loadJS("https://cdn.jsdelivr.net/npm/@tensorflow-models/speech-commands@0.4.0/dist/speech-commands.js")
      return (<>
        <Fthis.props.Component {...Fthis.props.pageProps} />
      </>
      )
    }
    return (
      <div style={{}}>
        LOADING
      </div>
    )
  }
}



export default MyApp
