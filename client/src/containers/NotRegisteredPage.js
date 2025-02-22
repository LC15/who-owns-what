import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Modal from 'components/Modal';
import LegalFooter from 'components/LegalFooter';
import Helpers from 'util/helpers';
import APIClient from 'components/APIClient';
import SocialShare from 'components/SocialShare';

import 'styles/NotRegisteredPage.css';

export default class NotRegisteredPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      buildingInfo: null
    }
  }

  componentDidMount() {
    if(this.props.geosearch && this.props.geosearch.bbl && !this.state.buildingInfo) {
      const bbl = this.props.geosearch.bbl;
      APIClient.getBuildingInfo(bbl)
        .then(results => this.setState({ buildingInfo: results.result }))
        .catch(err => {window.Rollbar.error("API error on Not Registered page: Building Info", err, bbl);}
      );
    }
  }

  render() {
    const geosearch = this.props.geosearch;
    const searchAddress = this.props.searchAddress;
    const buildingInfo = (this.state.buildingInfo && this.state.buildingInfo.length > 0 ? this.state.buildingInfo[0] : null);

    const usersInputAddress = 
      (searchAddress && searchAddress.boro && (searchAddress.housenumber || searchAddress.streetname) ?
        { 
          boro: searchAddress.boro,
          housenumber: (searchAddress.housenumber || ' '),
          streetname: (searchAddress.streetname || ' ') 
        } :
        buildingInfo && buildingInfo.boro && (buildingInfo.housenumber || buildingInfo.streetname) ?
        { 
          boro: buildingInfo.boro,
          housenumber: (buildingInfo.housenumber || ' '),
          streetname: (buildingInfo.streetname || ' ') 
        } : 
        null );
    const bblDash = <span className="unselectable" unselectable="on">-</span>;

    let boro, block, lot;
    let buildingTypeMessage;

    if(geosearch) {

      if(geosearch.bbl) {
        ({ boro, block, lot } = Helpers.splitBBL(geosearch.bbl));
      }

      if(buildingInfo && buildingInfo.bldgclass) {
        const generalBldgCat = (buildingInfo.bldgclass).replace(/[0-9]/g, '');
        switch(generalBldgCat) {
          case 'B':
            buildingTypeMessage = (
              <div>
                <p className="text-center">
                  This seems like a smaller residential building. If the landlord doesn't reside there, it should be registered with HPD. <nobr>(<i><a href={`http://www1.nyc.gov/assets/finance/jump/hlpbldgcode.html#${generalBldgCat.charAt(0)}`} target="_blank" rel="noopener noreferrer">Building Classification</a>: {buildingInfo.bldgclass}</i>)</nobr>
                  <a // eslint-disable-line jsx-a11y/anchor-is-valid
                    className="btn btn-block btn-link"
                    onClick={() => this.setState({ showModal: true })}
                  >What happens if the landlord has failed to register?</a>
                </p>
              </div>
            );
            break;
          case 'C':
            buildingTypeMessage = (
              <div>
                <p className="text-center">
                  <b>This building seems like it should be registered with HPD!</b> <nobr>(<i><a href={`http://www1.nyc.gov/assets/finance/jump/hlpbldgcode.html#${generalBldgCat.charAt(0)}`} target="_blank" rel="noopener noreferrer">Building Classification</a>: {buildingInfo.bldgclass}</i>)</nobr>
                  <a // eslint-disable-line jsx-a11y/anchor-is-valid
                    className="btn btn-block btn-link"
                    onClick={() => this.setState({ showModal: true })}
                  >What happens if the landlord has failed to register?</a>
                </p>
              </div>
            );
            break;
          default:
            buildingTypeMessage = (<p className="text-center">It doesn't seem like this property is required to register with HPD. <nobr>(<i><a href={`http://www1.nyc.gov/assets/finance/jump/hlpbldgcode.html#${generalBldgCat.charAt(0)}`} target="_blank" rel="noopener noreferrer"><u>Building Classification</u></a>: {buildingInfo.bldgclass}</i>)</nobr></p>);
            break;
        };
      }
    }


    if(!geosearch && !buildingInfo) {
      return (
        <div className="NotRegisteredPage Page">
          <div className="HomePage__content">
            <div className="HomePage__search">
              <h5 className="mt-10 text-danger text-center text-bold text-large">
                No address found
              </h5>
            </div>
         `</div>
        </div>
      );
    }

    return (
      <div className="NotRegisteredPage Page">
        <div className="HomePage__content">
          <div className="HomePage__search">
            <h5 className="mt-10 text-danger text-center text-bold text-large">
              No registration found
              {usersInputAddress ? (
                 <span> for {(usersInputAddress.housenumber === ' ' ? '' : (usersInputAddress.housenumber + ' '))}
                  {(usersInputAddress.streetname !== ' ' && (usersInputAddress.streetname))}</span>
              ) : (
                <span></span>
              )}!
            </h5>
            <h6 className="mt-10 text-center text-bold text-large">
              {buildingTypeMessage}
            </h6>
            <div className="wrapper">
                { buildingInfo && buildingInfo.latitude && buildingInfo.longitude &&
              <img src={`https://maps.googleapis.com/maps/api/streetview?size=800x200&location=${buildingInfo.latitude},${buildingInfo.longitude}&key=${process.env.REACT_APP_STREETVIEW_API_KEY}`}
                  alt="Google Street View" className="streetview img-responsive"  />
                }
              <div className="bbl-link">
                { geosearch && geosearch.bbl && buildingInfo ? (<span>Boro-Block-Lot (BBL): <nobr><a href={"https://zola.planning.nyc.gov/lot/"+boro + "/" + block + "/" + lot} target="_blank" rel="noopener noreferrer">{boro}{bblDash}{block}{bblDash}{lot}</a></nobr></span>):(<span></span>) }
              </div>
              <br />
              { geosearch && geosearch.bbl && buildingInfo && buildingInfo.housenumber && buildingInfo.streetname &&
                <div>
                  <p>Useful links:</p>
                  <div>
                    <div className="btn-group btn-group-block">
                      <a href={`http://a836-acris.nyc.gov/bblsearch/bblsearch.asp?borough=${boro}&block=${block}&lot=${lot}`} target="_blank" rel="noopener noreferrer" className="btn">View documents on ACRIS &#8599;</a>
                      <a href={`http://webapps.nyc.gov:8084/CICS/fin1/find001i?FFUNC=C&FBORO=${boro}&FBLOCK=${block}&FLOT=${lot}`} target="_blank" rel="noopener noreferrer" className="btn">DOF Property Tax Bills &#8599;</a>
                    </div>
                    <div className="btn-group btn-group-block">
                      <a href={`http://a810-bisweb.nyc.gov/bisweb/PropertyProfileOverviewServlet?boro=${boro}&block=${block}&lot=${lot}`} target="_blank" rel="noopener noreferrer" className="btn">DOB Building Profile &#8599;</a>
                      <a href={`https://hpdonline.hpdnyc.org/HPDonline/Provide_address.aspx?p1=${boro}&p2=${buildingInfo.housenumber}&p3=${buildingInfo.streetname}&SearchButton=Search`} target="_blank" rel="noopener noreferrer" className="btn">HPD Complaints/Violations &#8599;</a>
                    </div>
                  </div>
                </div>
              }

              <div className="social-share">
                <p>Share this page with your neighbors:</p>
                <SocialShare 
                  location="nycha-page"
                  url={usersInputAddress && encodeURI('https://whoownswhat.justfix.nyc/address/' + usersInputAddress.boro + '/' + usersInputAddress.housenumber + '/' + usersInputAddress.streetname).replace(" ", "%20")} // Support for Android
                  />
              </div>

              <br />
              {/* <div className="toast toast-error">
                <u>Note:</u> We're currently experiencing some difficulties due to an official NYC data service failing. We're working on it. If a search returns with "no results found", try it again in a minute or so!
              </div> */}
              <br />

              <Link className="btn btn-primary btn-block" to="/">
                &lt;-- Search for a different address
              </Link>
            </div>
            <Modal
              width={60}
              showModal={this.state.showModal}
              onClose={() => this.setState({ showModal: false })}>
              <h5>Failure to register a building with HPD</h5>
              <p>
                Buildings without valid property registration are subject to the following:
              </p>
              <ul>
                <li>Civil penalties of $250-$500</li>
                <li>May be issued official Orders</li>
                <li>Ineligible to certify violations</li>
                <li>Unable to request Code Violation Dismissals</li>
                <li>Unable to initiate a court action for nonpayment of rent.</li>
              </ul>
              <a className="btn" href="http://www1.nyc.gov/site/hpd/owners/compliance-register-your-property.page" target="_blank" rel="noopener noreferrer">Click here to learn more. &#8599;</a>
            </Modal>
          </div>
         </div>
        <LegalFooter />
      </div>
    );
    
  }
}
