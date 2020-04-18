import React from 'react';
import L, { Bounds, popup } from 'leaflet';
import styled from 'styled-components';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import mappic from './spaceupdat.jpg';
import { object } from 'prop-types';
import 'leaflet-easyprint/dist/bundle.js'

const Wrapper = styled.div`
    width: $(props => props.width);
    height: $(props => props.height);
`; 
//Json File
var dimensions;
//console.log(data);
 //dimensions of the various booths
var booths = {};
export default class Maps extends React.Component{
    constructor(props) {
        super(props);
        this.state = ({
            boothID: '',
            boothID2: '',
            width: '',
            height: '',
            entries: [],
            dimensions: {},
            sWlat: '',
            sWlng: '',
            nElat: '', 
            nElng: '', 
            boothno: '',
            topleft1: '',
            topleft2: '',
            dim1: '',
            dim2: '',
            notallocated: '',
            newlong: '',
            newlat: '',
            oldlong: '',
            oldlat: '',
            booth: '',
        });
        this.handleChange = this.handleChange.bind(this);
        this.handleChange1 = this.handleChange1.bind(this);
      }
    handleChange(e){
        //this.setState({[evt.target.name]: evt.target.value})
        this.setState({
            [e.target.name]: e.target.name === 'width' || 'height' ? parseInt(e.target.value) : e.target.value,
            });
        
    }
    handleChange1(evt){
        this.setState({[evt.target.name]: evt.target.value});
    }
    handleSubmit = event => {
        event.preventDefault()
        console.log(this.state)
        try{
            this.setState({
                dimensions:{ 
                    ...this.state.dimensions, [this.state.boothID]:
                    [[this.state.dimensions[this.state.boothID][0][0], this.state.dimensions[this.state.boothID][0][1]], [this.state.width, this.state.height]]
                }}, () => {
                    this.addProduct(this.state.boothID);
                    console.log(this.state.dimensions[this.state.boothID])
                  }); 
        }
        catch{
            alert("Please Check Inputs");
        }
        
       
    }
    handleSubmit2 = event =>{
        event.preventDefault();
        console.log(this.state.boothID2);
        try{
            booths[this.state.boothID2].setPopupContent("Booth ID: " +  this.state.boothID2 + "| Group Name: " + dimensions[this.state.boothID2][2] +  "| Width: " + dimensions[this.state.boothID2][1][0] + "| Breadth: " + dimensions[this.state.boothID2][1][1] + "| X: " + dimensions[this.state.boothID2][0][0] + "| Y: " + dimensions[this.state.boothID2][0][1]).openPopup();

        }
        catch{
            alert("Please Key in Valid Booth No.")
        }
    }
    //L.rectangle([[Number(this.state.height), Number(this.state.width)],[55,110]]));
    getProducts = _ => {
        fetch('http://localhost:3535/registration')
        .then(response => response.json())
        .then(response => this.setState({entries: response.data}))
        .catch(err => console.error(err))
        
    };
    
    addProduct(boothno){
        fetch(`http://localhost:3535/registration/update?id="${boothno}"&width=${this.state.dimensions[boothno][1][0]}&height=${this.state.dimensions[boothno][1][1]}&PosX=${this.state.dimensions[boothno][0][0]}&PosY=${this.state.dimensions[boothno][0][1]}`)
        .then(response => response.json())
        .then(this.getProducts)
        .then(alert("Updated Successfully"))
        .catch(err => console.error(err))

    };

    componentDidMount(){
        this.getProducts();
        setTimeout(() => {
            if(this.state.entries != null){
                for(const key of this.state.entries.keys()){
                    this.setState({
                        dimensions:{ 
                            ...this.state.dimensions, [this.state.entries[key]["id"]]:
                            [[this.state.entries[key]["PosX"], this.state.entries[key]["PosY"]], [this.state.entries[key]["width"], this.state.entries[key]["height"]], this.state.entries[key]["groupName"]]
                        }
                        
                    })
                }
            }
            console.log(this.state.dimensions);
            dimensions = this.state.dimensions;
            for(var key in dimensions){
                if(dimensions[key][0][0] && dimensions[key][0][1] == -1){
                    this.setState({notallocated: this.state.notallocated.concat(key)});
                    this.setState({notallocated: this.state.notallocated.concat(", ")});
                    } 
                //var newlong = (((dimensions[key][0][0] + dimensions[key][1][0])/132)*92);
                this.setState({newlong: (((dimensions[key][0][0] + dimensions[key][1][0])/132)*92)});
                //var newlat = (((dimensions[key][0][1] + dimensions[key][1][1])/132)*91);
                this.setState({newlat: (((dimensions[key][0][1] + dimensions[key][1][1])/132)*91)});
                //var oldlong = ((dimensions[key][0][0]/132)*92);
                this.setState({oldlong: ((dimensions[key][0][0]/132)*92)});
                //var oldlat = ((dimensions[key][0][1]/132)*91);
                this.setState({oldlat: ((dimensions[key][0][1]/132)*91)});
                //this.map.addLayer(L.rectangle([[-oldlat, oldlong], [-newlat, newlong]], {pmIgnore: false}));
                //var booth = L.rectangle([[-oldlat, oldlong], [-newlat, newlong]], {pmIgnore: false});
                this.setState({booth: L.rectangle([[-this.state.oldlat, this.state.oldlong], [-this.state.newlat, this.state.newlong]], {pmIgnore: false})});
                //var booth2 = L.rectangle([[-67.12121212121212, 26.484848],[-57.469,42.5]]).addTo(this.map);
                this.state.booth.pm.enable({
                    allowSelfIntersection: false,
                });
                this.state.booth.bindPopup(
                    "Booth ID: " +  key + "| Group Name: " + dimensions[key][2] +  "| Width: " + dimensions[key][1][0] + "| Breadth: " + dimensions[key][1][1] + "| X: " + dimensions[key][0][0] + "| Y: " + dimensions[key][0][1]);  
                booths[key] = this.state.booth; 
                this.state.booth.addTo(this.map);
                
                //If point is edited 
                this.state.booth.on('pm:edit', e => {
                        this.setState({sWlat: e.target._bounds._southWest.lat});
                        this.setState({sWlng: e.target._bounds._southWest.lng});
                        this.setState({nElat: e.target._bounds._northEast.lat});
                        this.setState({nElng: e.target._bounds._northEast.lng});
                        //get booth no. and convert to int
                        //topleft1 is dimensions[key][0][0], topleft2 is dimensions[key][0][1]
                        this.setState({boothno: e.target._popup._content.slice(10,13) });
                        this.setState({topleft1: Math.round((this.state.sWlng/92)*132)});
                        this.setState({topleft2: Math.round((-this.state.nElat/91)*132)});
                        this.setState({dim1: Math.round(((this.state.nElng/92)*132)-this.state.topleft1)});
                        this.setState({dim2: Math.round(((-this.state.sWlat/91)*132)-this.state.topleft2)})
                        booths[this.state.boothno].setPopupContent("Booth ID: " +  this.state.boothno + "| Group Name: " + dimensions[this.state.boothno][2]  + "| Width: " + this.state.dim1 + "| Breadth: " + this.state.dim2 + "| X: " + this.state.topleft1 + "| Y: " + this.state.topleft2);
                
                        this.setState({
                            dimensions:{ 
                                ...this.state.dimensions, [this.state.boothno]:
                                [[this.state.topleft1, this.state.topleft2], [this.state.dim1, this.state.dim2]]
                            }}, () => {
                                this.addProduct(this.state.boothno);
                            }); 
                            
                    
                        

                    //console.log(boothno, "old", dimensions[boothno], "new", [[topleft1, topleft2], [dim1,dim2]]);
                });

        
            }
        }, 1000);
    
        this.map = L.map('map',
        {
            crs: L.CRS.Simple,
            minZoom: 2,
            maxZoom: 3, 
            zoomControl: true,
            center: [0,0],
            zoom: 1,
        });
        //w and h based on the size of the image 
        var w = 363;
        var h = 370;
        var imageUrl = mappic;
        var southWest = this.map.unproject([ 0, h], this.map.getMaxZoom()-1);
        var northEast = this.map.unproject([ w, 0], this.map.getMaxZoom()-1);
        var bounds = new L.LatLngBounds( southWest, northEast);
        L.imageOverlay(imageUrl, bounds).addTo(this.map);
        //toprint the map
        L.easyPrint().addTo(this.map);
        //dimensions of full map [[-100,540], [100,-180]]
        //console.log(booths);
        this.map.setMaxBounds(bounds);
        this.map.pm.setGlobalOptions({allowSelfIntersection: false});
        //Sets toolbar on the left map 
        this.map.pm.addControls({
            position: 'topleft',
            drawCircle: false,
            drawMarker: false,
            drawPolygon: false,
            drawPolyline: false,
            drawCircleMarker: false,
            cutPolygon: false,
            drawRectangle: false,
          });
        this.map.on('pm:remove', e =>{
            if(e.layer._popup._content != null){
                this.setState({boothno: e.layer._popup._content.slice(10,13)});
                this.setState({
                    dimensions:{ 
                        ...this.state.dimensions, [this.state.boothno]:
                        [[-1,-1], [this.state.dimensions[this.state.boothno][1][0], this.state.dimensions[this.state.boothno][1][1]]]
                    }}, () => {
                        this.addProduct(this.state.boothno);
                      });
                window.location.reload(false);
                //this.setState({notallocated: this.state.notallocated.concat(this.state.boothno)});
                //this.setState({notallocated: this.state.notallocated.concat(", ")});
                
                //this.setState({notallocated: " "})
                
                

            }     
        });
    

        
    } 

    
    render(){
        return (
            <div>
                <form onSubmit = {this.handleSubmit} >
                    <label>
                        Booth ID: 
                    </label>
                    <input 
                    type="text" name="boothID" id="boothID" onChange={this.handleChange1}/>
                    <label>
                        Width: 
                    </label>
                    <input
                    type="text" name="width" id="width" onChange={this.handleChange}/>
                    <label>
                        Breadth: 
                    </label>
                    <input
                    type="text" name="height" id="height" onChange={this.handleChange}/>
                    <button type="submit" id="changebtn">Add Booth to Map</button>
                </form>
                <form onSubmit = {this.handleSubmit2} >
                    <label>
                        Booth ID: 
                    </label>
                    <input 
                    type="text" name="boothID2" id="boothID2" onChange={this.handleChange1}/>
                    <button type="submit" id="viewbtn">View Booth on Map</button>
                </form>
                <label>
                    Booths Yet To Be Allocated: {this.state.notallocated}
                </label>
                

                
                <Wrapper width="512px" height="512px" id="map" />
            </div>
        )
    }
}

