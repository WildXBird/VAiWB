import React, { PureComponent } from 'react';
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
      // link.href = 'https://cdn.jsdelivr.net/npm/antd@3.26.20/dist/antd.min.css';
      // link.href = 'https://cdn.jsdelivr.net/npm/antd@4.15.2/dist/antd.min.css';
      link.href = 'https://cdn.jsdelivr.net/npm/antd@4.15.1/dist/antd.min.css';
      head.appendChild(link)
    }
  }
  render() {
    let Fthis = this

    if (this.state.ready) {
      return (<>
        <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/speech-commands@0.4.0/dist/speech-commands.min.js"></script>
        <Fthis.props.Component {...Fthis.props.pageProps} />
      </>
      )
    }
    return (
      <div style={{}}>
        <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/speech-commands@0.4.0/dist/speech-commands.min.js"></script>
        LOADING
      </div>
    )
  }
}



export default MyApp
