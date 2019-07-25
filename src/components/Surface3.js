import React from 'react';
import Container from 'react-bootstrap/Container';
import PropTypes from 'prop-types';
import Axios from 'axios'

import ImageTextWrapper from './ImageTextWrapper';

import {runQuery} from './utils'
import {getSurfaceInfo, getBlockLines} from './Queries'

class Surface3 extends React.Component {
  constructor(props){
    super(props)
    this.mounted = ""
    this.handleNext = this.handleNext.bind(this)
    this.handlePrevious = this.handlePrevious.bind(this)
    this.state = {
      region: "full",
      surfaces: [
      ]
    }

  }
  handleNext(){
    //this.retrieveSurfaceInfo(this.state.next)
    this.props.handleSurfaceFocusChange(this.state.next)
  }
  handlePrevious(){
    //this.retrieveSurfaceInfo(this.state.previous)
    this.props.handleSurfaceFocusChange(this.state.previous)

  }
  retrieveSurfaceInfo(manifestationid){
    // manifest id should be retrieved from query
    // this is a temporary measure until db is corrected and query is posible
    const blockLineInfo = runQuery(getBlockLines(manifestationid))
    blockLineInfo.then((d1) => {
      d1.data.results.bindings.forEach((z) => {
        const surfaceid = z.surface.value
        const firstLine = z.first.value
        const lastLine = z.last.value
        const order = z.order.value
        //const manifest = "http://scta.info/iiif/" + this.props.topLevel.split("/resource/")[1] + "/" + surfaceid.split("/resource/")[1].split("/")[0] + "/" + "manifest";
        const surfaceInfo = runQuery(getSurfaceInfo(surfaceid))
        surfaceInfo.then((d) => {
          const b = d.data.results.bindings[0]
          // only preceed if sparql query returns results
          if (b){
            //second nested async call for annotation list
            const alUrl = "https://exist.scta.info/exist/apps/scta-app/folio-annotaiton-list-from-simpleXmlCoordinates.xq?surfaceid=" + surfaceid.split("/resource/")[1]
            Axios.get(alUrl).then((d2) => {
              //const resources = d2.data.resources
              if (this.mounted){
                this.setState((prevState) => {
                  const newSurface = {
                    currentSurfaceId: surfaceid,
                    surfaceTitle: b.surfaceTitle ? b.surfaceTitle.value : "",
                    //manifest: manifest,
                    canvas: b.canvas.value,
                    imageurl: b.imageurl.value,
                    next: b.next_surface ? b.next_surface.value : "",
                    previous: b.previous_surface ? b.previous_surface.value : "",
                    annotations: d2.data ? d2.data.resources : "",
                    surfaceid: surfaceid,
                    firstLine: firstLine,
                    lastLine: lastLine,
                    order: order

                  }
                return {
                  surfaces: [
                    ...prevState.surfaces,
                    newSurface
                    ]
                  }
                })
              }
            }).catch((error) => {
              console.log("failed retrieving annotationlist: ", error)
              if (this.mounted){
                this.setState((prevState) => {
                  const newSurface = {
                    currentSurfaceId: surfaceid,
                    surfaceTitle: b.surfaceTitle.value,
                    //manifest: manifest,
                    canvas: b.canvas.value,
                    imageurl: b.imageurl.value,
                    next: b.next_surface ? b.next_surface.value : "",
                    previous: b.previous_surface ? b.previous_surface.value : "",
                    annotations: "",
                    surfaceid: surfaceid,
                    firstLine: firstLine,
                    lastLine: lastLine,
                    order: order

                  }
                return {
                  surfaces: [
                    ...prevState.surfaces,
                    newSurface
                  ]
                }
              })
            }
          })
        }
      })
    })
  })
}
componentDidMount(){
  this.mounted = true
    if (this.props.manifestationid){
      this.setState((prevState) => {
        return {
          surfaces: []
        }
      },
      this.retrieveSurfaceInfo(this.props.manifestationid)
    )
    }
  }
  componentWillReceiveProps(nextProps){
    if (nextProps.manifestationid !== this.props.manifestationid){
      this.setState((prevState) => {
        return {
          surfaces: []
        }

      },
    this.retrieveSurfaceInfo(nextProps.manifestationid))
    }
  }
  componentWillUnmount(){
    this.mounted = false
  }
  render() {
    const displayAllImages = () => {
      const sortedSurfaces = this.state.surfaces.sort((a, b) => {
        if (a.order > b.order) return 1;
        if (b.order > a.order) return -1;
        return 0;
      })
      const surfacesDisplay = sortedSurfaces.map((surface) => {
        return displayImages(surface)
      })
      return surfacesDisplay
    }
    const displayImages = (surface) => {
      // handle line display
      if (surface.annotations && this.props.annotationsDisplay === "lines"){
        const imageTextWrappers = surface.annotations.map((h, i) => {

          if (i + 1 >= surface.firstLine && i < surface.lastLine){
            const text = h.resource.chars;
            const canvas = h.on.split("#xywh=")[0];
            const canvasShort = canvas.split("/")[canvas.split("/").length - 1];
            const coords = h.on.split("#xywh=")[1];
            const imageUrl = h.imageUrl
            const label = h.label
            return (
              <ImageTextWrapper key={i}
                imageUrl={imageUrl}
                canvas={canvas}
                coords={coords}
                canvasShort={canvasShort}
                text={text}
                label={label}
                targetLabel={this.props.targetLabel}
                surfaceButton={false}
                displayWidth={this.props.width}
                />
              )
            }
            else{
              return null
            }

        })
        return imageTextWrappers
      }
      // handle paragraph display
      else if (surface.annotations && this.props.annotationsDisplay === "paragraph"){
        const h = surface.annotations[surface.firstLine - 1]
        const fl = surface.annotations[surface.firstLine - 1]
        const flcanvas = fl ? fl.on.split("#xywh=")[0] : ""
        const flcanvasShort = flcanvas.split("/")[flcanvas.split("/").length - 1];
        const flcoords = fl ? fl.on.split("#xywh=")[1] : ""
        const y = flcoords.split(",")[1]
        const ll = surface.annotations[surface.lastLine - 1]
        //const llcanvas = ll ? ll.on.split("#xywh=")[0] : ""
        //const llcanvasShort = llcanvas.split("/")[llcanvas.split("/").length - 1];
        const llcoords = ll ? ll.on.split("#xywh=")[1] : ""
        const lly = llcoords.split(",")[1]
        const llh = llcoords.split(",")[3]
        const llbottom = (parseInt(lly) + parseInt(llh)) - parseInt(y)
        const coords = (parseInt(flcoords.split(",")[0] - 10)) + "," + (parseInt(y)) + "," + (parseInt(flcoords.split(",")[2]) + 10) + "," + (parseInt(llbottom) + 50)
        const text = ""
        const imageUrl = h ? h.imageUrl : ""
        // check to see if an Image Url has been found.
        // if not show "error message"
        if (imageUrl){

          return (
            <ImageTextWrapper
              key={surface.currentSurfaceId + "-" + surface.order}
              imageUrl={imageUrl}
              canvas={flcanvas}
              coords={coords}
              canvasShort={flcanvasShort}
              text={text}
              label={""}
              targetLabel={""}
              surfaceButton={false}
              displayWidth={this.props.width}
              />
            )
          }
          else {
            return (<p key={surface.currentSurfaceId + "-" + surface.order}>Sorry, this image is not yet ready</p>)
          }
        }
      else{
        return <img key={surface.currentSurfaceId + "-" + surface.order} alt="manuscript" src={surface.imageurl + "/full/" + this.props.width + ",/0/default.jpg"}/>
      }
    }
    return (
      <Container className={this.props.hidden ? "hidden" : "showing"}>
      {displayAllImages()}
      </Container>

    );
  }

}
Surface3.defaultProps = {
  width: "500"
};

Surface3.propTypes = {
  /**
  * a string indicating desired width in pixels for image display
  *
  * TODO: it might be desireable to change propType to an integer. I'm not sure.
  */
  width: PropTypes.string,
  /**
  * manifestation id
  */
  manifestationid: PropTypes.string,
  /**
  * indicates what kind of display is desired, "lines, paragraph, surface/null"
  */
  annotationsDisplay: PropTypes.string
}

export default Surface3;
