import React, { PureComponent } from 'react';
import Head from 'next/head'
import Image from 'next/image'
import { Modal, Button } from 'antd';

import styles from '../styles/Home.module.css'
import CityList from '../public/cityList'
import { Typography } from 'antd';

const { Title } = Typography;

var recognizer
var probabilityMin = 0.8




class Home extends PureComponent {
  constructor(props) {
    super(props)
    this.ref = React.createRef();
    this.state = {
    }
  }
  componentDidMount() {
    let Fthis = this
    // this.setState({
    //   ready: true,
    // })
    window.hasText = function (source, keyword) {
      if (typeof (source) == "string" && typeof (keyword) == "string" && source.indexOf(keyword) != -1) {
        return true
      }
      return false
    }
    this.startListening = function () {
      // recognizer.stopListening()
      Fthis.startListeningOrder()
      Fthis.setState({
        startListening: true,
        stopListening: true,
      })
    }
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    var SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList
    var SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent
    var speechSynthesis = window.speechSynthesis || window.webkitSpeechSynthesis
    var SpeechSynthesisUtterance = window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance
    var SpeechRecognitionLanguage = 'zh-CN'
    this.startListeningOrder = function () {
      console.log("startListeningOrder")
      window.currentUserSpeakText = ""
      // {
      //   const audio = new Audio();
      //   audio.autoplay = true;
      //   audio.src = 'https://cdn.jsdelivr.net/gh/WildXBird/VAiWB/my-app/public/hello.mp3';
      // }

      var recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.lang = SpeechRecognitionLanguage;
      recognition.interimResults = true
      recognition.maxAlternatives = 5
      console.log("recognition.lang", recognition.lang)
      // setTimeout(() => {
      recognition.start();
      // }, 500);

      recognition.onresult = function (event) {
        let lastLine = event.results[event.results.length - 1]
        let isFinal = lastLine.isFinal
        let confidence = lastLine[0].confidence
        let words = lastLine[0].transcript || ""
        words = words.replace("?", "").replace("???", "")
        console.log("recognition.words", isFinal, words)
        if (isFinal) {
          Fthis.dealOrder(words)
          recognition.stop();
          Fthis.setState({ startListening: false, })
        }
        Fthis.setState({
          currentText: words,
          currentTextConfidence: confidence,
          currentTextIsFinal: isFinal,
        })
      }
      recognition.onspeechend = function (event) {
        console.warn('onspeechend');
        recognition.stop();
      }
      recognition.onsoundend = function (event) {
        console.warn('onsoundend');
      }
      recognition.onerror = function (event) {
        recognition.stop();
        Fthis.speakText('???????????????????????????')
        window.botIsListening = false
        console.warn('Error occurred in recognition: ' + event.error);
      }
    }
    this.dealOrder = function (text = "") {
      Fthis.setState({ tryResponse: true })
      console.log("dealOrder", text)
      if (hasText(text, "??????") || hasText(text, "??????") || hasText(text, "???") || hasText(text, "???") || hasText(text, "???")) {
        Fthis.search4Weather(text).then(function (response) {
          console.log("search4Weather.response", response);
          Fthis.setState({ tryResponse: false })
          Fthis.speakText(response).then(function (response) {
            Fthis.resetState()
          })
        }).catch(function (error) {
          Fthis.setState({ tryResponse: false, speaking: false })
          Fthis.speakText(error).then(function (response) {
            Fthis.resetState()
          })
        })
        return
      } else if (hasText(text, "???") || hasText(text, "??????") || hasText(text, "??????")) {
        Fthis.deviceControl(text).then(function (response) {
          console.log("deviceControl.response", response);
          Fthis.setState({ tryResponse: false })
          Fthis.speakText(response).then(function (response) {
            Fthis.resetState()
          })
        }).catch(function (error) {
          Fthis.setState({ tryResponse: false, speaking: false })
          Fthis.speakText(error).then(function (response) {
            Fthis.resetState()
          })
        })
        return
      }

      //????????????
      console.log("????????????", text)
      Fthis.resetState()
    }
    this.deviceControl = function (text) {
      return new Promise(function (resolve, reject) {
        let url = `https://dev-vaiwb.r6sg.workers.dev/${text}`
        fetch(url).then(response => response.json()).then(response => {
          resolve("??????")
        }).catch(response => {
          resolve("??????????????????")
        })
      })
    }
    this.search4Weather = function (text = "") {
      return new Promise(function (resolve, reject) {
        setTimeout(() => {
          reject("???????????????")
        }, 4000);

        let cityId = "101020600"
        let day = 0
        let hasCity = false

        if (hasText(text, "??????")) {
          day = -1
        } else if (hasText(text, "??????") || hasText(text, "??????")) {
          day = 0
        } else if (hasText(text, "??????")) {
          day = 1
        } else if (hasText(text, "??????")) {
          day = 2
        } else if (hasText(text, "?????????")) {
          day = 3
        }

        for (let cityItem of CityList) {
          let name = cityItem.city_name
          let nameLastWord = name.substring(name.length - 1)
          if (nameLastWord == "???" || nameLastWord == "???" || nameLastWord == "???") {
            name = name.substring(0, name.length - 1)
          }
          if (hasText(text, name)) {
            console.log("cityHit", name, cityItem);
            cityId = cityItem.city_code
            hasCity = true
          }
        }

        //????????????????????? cistList.js ?????? responseExample
        let url = `https://dev-vaiwb.r6sg.workers.dev/${cityId}`
        fetch(url)
          .then(response => response.json())
          .then(data => {
            let city = data.cityInfo.city
            data = data.data
            console.log(data)
            let yesterday = data.yesterday
            let forecast = data.forecast
            forecast[-1] = yesterday
            let today = data.forecast[0]
            console.log("forecast", forecast);
            let temperatureTrans = function (text, numOutput = false) {
              text = text.replace(/[^0-9-]/ig, "");
              if (numOutput) {
                return parseInt(text)
              } else {
                text.replace("-", "??????")
                text += "???"
                return text
              }
            }
            let aqiTransSentence = function (num) {
              // AQI??????
              //https://zh.wikipedia.org/wiki/%E7%A9%BA%E6%B0%A3%E5%93%81%E8%B3%AA%E6%8C%87%E6%A8%99
              num = parseInt(num)
              if (!(num > -1)) {
                return ""
              }
              let word = ""
              if (num < 51) {
                word = "???"
              } else if (num < 101) {
                word = "??????"
              } else if (num < 151) {
                word = "????????????"
              } else if (num < 201) {
                word = "????????????"
              } else if (num < 301) {
                word = "????????????"
              } else {
                word = "??????????????????"
              }
              let text = `???????????? ${word}`
              return text
            }


            let creatBaseResponse = function (data, dayText, weatherChangeText) {
              return `${dayText}${city}${data.type}???????????? ${temperatureTrans(data.low)}???????????? ${temperatureTrans(data.high)}???${weatherChangeText || ""}${aqiTransSentence(data.aqi)}???${data.notice || ""}???`
            }
            let responseText = ""
            if (day == 0) {
              let weatherChangeText = ""
              let yesterdayMaxTemp = temperatureTrans(yesterday.high, true)
              if (yesterdayMaxTemp > 27) {
                let todayMaxTemp = temperatureTrans(today.high, true)
                let gap = todayMaxTemp - yesterdayMaxTemp
                if (gap > 0) {
                  weatherChangeText += `?????????????????????${Math.abs(gap)}??????`
                } else if (gap < 0) {
                  weatherChangeText += `?????????????????????${Math.abs(gap)}??????`
                }
              }
              let yesterdayMinTemp = temperatureTrans(yesterday.low, true)
              if (yesterdayMinTemp < 22) {
                let todayMinTemp = temperatureTrans(today.low, true)
                let gap = todayMinTemp - yesterdayMinTemp
                if (gap > 0) {
                  weatherChangeText += `?????????????????????${Math.abs(gap)}??????`
                } else if (gap < 0) {
                  weatherChangeText += `?????????????????????${Math.abs(gap)}??????`
                }
              }
              responseText = `${creatBaseResponse(today, "??????", weatherChangeText)}`
            } else if (day == -1) {
              responseText = `${creatBaseResponse(yesterday, "??????")}`
            } else if (day == 1) {
              responseText = `${creatBaseResponse(forecast[1], "??????")}`
            } else if (day == 2) {
              responseText = `${creatBaseResponse(forecast[1], "??????")}`
            } else if (day == 3) {
              responseText = `${creatBaseResponse(forecast[1], "?????????")}`
            }
            console.log("responseText", responseText)
            resolve(responseText)
          })
          .catch(function (error) {
            console.log("error", error);
          })
      })
    }
    this.resetState = function (text) {
      // recognizer.startListening()
      console.log("recognizer", recognizer)
      console.log("recognizer.startListening", recognizer.startListening)
      Fthis.setState({
        stopListening: false,
        startListening: false,
        tryResponse: false,
        speaking: false,
      })
      setTimeout(() => {
        Fthis.setState({
          currentText: undefined,
          responseText: undefined,
        })
      }, 200);
    }
    this.speakText = function (text) {
      return new Promise(function (resolve, reject) {
        console.log("speakText");
        Fthis.setState({ responseText: text, speaking: true })
        var utterThis = new SpeechSynthesisUtterance(text);

        let speakerList = speechSynthesis.getVoices()
        for (let item of speakerList) {
          if (hasText(item.name, "Microsoft Xiaoxiao")) {
            utterThis.voice = item;
            break
          } else if (hasText(item.name, "Google ?????????")) {
            utterThis.voice = item;
            break
          } else if (hasText(item.name, "Microsoft Huihui Desktop")) {
            utterThis.voice = item;
          }
        }
        console.log("utterThis", utterThis);
        let speechEnd = function () {
          setTimeout(() => {
            resolve(true)
          }, 2000);
        }
        // https://gist.github.com/kypflug/d5cce2c55bd3b8c62eb74403ec089a55
        utterThis.addEventListener("end", speechEnd);
        utterThis.addEventListener("error", speechEnd);
        // utterThis.addEventListener("boundary", (event)=>{console.log("event",event);});

        speechSynthesis.speak(utterThis);


        // utterThis.onpause = function(event) { 
        //   console.log('Speech paused after ' + event.elapsedTime + ' milliseconds.');
        //  };
      })
    }
    // this.speakText("??????")
    // return
    {
      // more documentation available at
      // https://github.com/tensorflow/tfjs-models/tree/master/speech-commands
      // the link to your model provided by Teachable Machine export panel
      const URL = "https://cdn.jsdelivr.net/gh/WildXBird/VAiWB/sg_Model/";
      async function createModel() {
        const checkpointURL = URL + "model.json"; // model topology
        const metadataURL = URL + "metadata.json"; // model metadata

        const recognizer = speechCommands.create(
          "BROWSER_FFT", // fourier transform type, not useful to change
          undefined, // speech commands vocabulary feature, not useful for your models
          checkpointURL,
          metadataURL);
        // check that model and metadata are loaded via HTTPS requests.
        await recognizer.ensureModelLoaded();

        return recognizer;
      }

      async function init() {
        recognizer = await createModel();
        const classLabels = recognizer.wordLabels(); // get class labels
        // const labelContainer = document.getElementById("label-container");
        // for (let i = 0; i < classLabels.length; i++) {
        //   labelContainer.appendChild(document.createElement("div"));
        // }
        recognizer.listen(result => {
          if (Fthis.state.tfjsReady !== true) {
            Fthis.setState({
              tfjsReady: true
            })
          }
          const scores = result.scores; // probability of prediction for each class
          if (scores[1] > probabilityMin && !Fthis.state.stopListening) {
            Fthis.startListening()
            return
          }
          Fthis.setState({ probability: parseInt(scores[1] * 10000) / 100 })
        }, {
          includeSpectrogram: true, // in case listen should return result.spectrogram
          probabilityThreshold: 0.75,
          invokeCallbackOnNoiseAndUnknown: true,
          overlapFactor: 0.50 // probably want between 0.5 and 0.75. More info in README
        });
      }
      init()
    }
  }
  componentWillUnmount() {
    recognizer.stopListening()
  }
  render() {
    let Fthis = this
    let subTitle = "????????????AI??????"
    if (this.state.tfjsReady) {
      subTitle = <>
        {"????????????"}
        <br />
        {/* <code className={styles.code}>{"?????? ????????????"}</code> */}
        <code className={styles.code}>{this.state.probability}%</code>
      </>
    }
    return (
      <div className={styles.container}>
        <Head>
          <title>Create Next App</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <h1 className={styles.title}>
            {/* {"???????????????"}<a>{"????????????"}</a> */}
          </h1>

          <p className={styles.description}>
            {subTitle}
          </p>
          <Button type="primary" disabled={!this.state.tfjsReady} onClick={() => { Fthis.startListening() }}>{"????????????"}</Button>
          <div id="label-container"></div>


          <Modal
            title={null}
            footer={null}
            visible={this.state.startListening || this.state.tryResponse || this.state.speaking}
            closable={false}
          // onOk={handleOk}
          //  onCancel={handleCancel}
          >
            {/* <Title level={5} style={{ color: !!this.state.currentTextIsFinal ? "#00000000" : "#0000004a", }}>{"?????????"}</Title> */}
            <Title level={3} style={{
              marginTop: "0.5em",
              color: this.state.currentTextIsFinal ? "#000" : "#0000004a",
              fontWeight: 600
            }}>{this.state.currentText || "?????????..."}</Title>
            <Title style={{
              marginTop: "0.5em",
              color: "#1890FF",
              fontWeight: 500
            }}>{this.state.responseText || ""}</Title>

          </Modal>

        </main>

        <footer className={styles.footer}>
          {"????????????"}
          {/* <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Powered by{' '}
            <span className={styles.logo}>
              <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
            </span>
          </a> */}
        </footer>
      </div>
    )
  }
}


export default Home