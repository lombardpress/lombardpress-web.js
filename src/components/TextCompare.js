import React from 'react';
import Diff from 'diff-match-patch'
import Axios from 'axios'

import TextCompareItem from './TextCompareItem'

class TextCompare extends React.Component {
  constructor(props){
    super(props)
    this.getText = this.getText.bind(this)
    this.handleChangeBase = this.handleChangeBase.bind(this)
    this.mounted = ""
    this.state = {
      baseText: ""
    }

  }
  handleChangeBase(rawText){
    this.setState({baseText: rawText})
  }
  getText(ctranscription){


    Axios.get("http://exist.scta.info/exist/apps/scta-app/csv-pct.xq?resourceid=" + ctranscription).
          then((text) => {
            if (this.mounted === true){
              this.setState({baseText: text.data})
            }
          })
        }
  componentDidMount(){
    this.mounted = true;
    this.getText(this.props.info.ctranscription)
  }


  componentWillReceiveProps(nextProps){
    this.getText(nextProps.info.ctranscription)
  }
    componentWillUnmount(){
        this.mounted = false;
  }

  render(){
    const displayComparisons = () => {
      const texts = this.props.info.manifestations.map((m) => {
        return (
          <TextCompareItem
          key={m.transcription}
          base={this.state.baseText}
          compareTranscription={m.transcription}
          handleChangeBase={this.handleChangeBase}
          />
        )
      })
      return texts
    }

  return (
    <div className={this.props.hidden ? "hidden" : "showing"}>
    {displayComparisons()}
    </div>

  );
  }
}

export default TextCompare;