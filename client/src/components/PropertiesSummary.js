import React, { Component } from 'react';

import Loader from 'components/Loader';
import LegalFooter from 'components/LegalFooter';
import APIClient from 'components/APIClient';
import SocialShare from 'components/SocialShare';

import 'styles/PropertiesSummary.css';

const VIOLATIONS_AVG = 0.7; // By Unit

// 1656793 open violations according to wow_bldgs
// 2331139 total units in registered buildings, according to wow_bldgs

// Data updated 6/6/19

export default class PropertiesSummary extends Component {
  constructor(props) {
    super(props);

    this.state = { agg: null };
  }

  componentDidUpdate(prevProps, prevState) {

    // make the api call when we come into view and have
    // the user addrs bbl
    if(this.props.isVisible && this.props.userAddr && !this.state.agg) {
      APIClient.getAggregate(this.props.userAddr.bbl)
        .then(results => this.setState({ agg: results.result[0] }))
        .catch(err => console.error(err));
    }
  }

  render() {
    let agg = this.state.agg;

    return (
      <div className="Page PropertiesSummary">
        <div className="PropertiesSummary__content Page__content">
          { !this.state.agg ? (
            <Loader loading={true} classNames="Loader-map">Loading</Loader>
          ) : (
            <div>
              <h6>General info</h6>
              <p>
                There {parseInt(agg.bldgs) === 1 ? 
                  <span>is <b>1</b> building </span> :
                  <span>are <b>{agg.bldgs}</b> buildings </span>}
                in this portfolio with a total of {agg.units} unit{parseInt(agg.units) === 1 ? "" : "s"}.
                The {parseInt(agg.bldgs) === 1 ? "" : "average"} age of {parseInt(agg.bldgs) === 1 ? "this building " : "these buildings "}
                is <b>{agg.age}</b> years old.
              </p>
              <aside>
                {agg.violationsaddr && (
                  <figure className="figure">
                    <img src={`https://maps.googleapis.com/maps/api/streetview?size=800x500&location=${agg.violationsaddr.lat},${agg.violationsaddr.lng}&key=${process.env.REACT_APP_STREETVIEW_API_KEY}`}
                           alt="Google Street View" className="img-responsive"  />
                    <figcaption className="figure-caption text-center text-italic">
                      {agg.violationsaddr.housenumber} {agg.violationsaddr.streetname}, {agg.violationsaddr.boro} currently has {agg.violationsaddr.openviolations} open HPD violations - the most in this portfolio.
                    </figcaption>
                  </figure>
                )}

              </aside>
              <h6>Landlord</h6>
              <p>The most common
                  {agg.topowners.length > 1 ?
                  <span> names that appear in this portfolio are </span> : 
                  <span> name that appears in this portfolio is </span> }
                <b>{agg.topowners && agg.topowners.map((owner,idx) => {
                  return (
                    <span key={idx}>
                      {!idx ? " " : idx < agg.topowners.length - 1 ? ", " : ", and "}
                      {owner}
                    </span>
                  );
                })}</b>.
                The most common corporate entity is <b>{agg.topcorp || `n/a`}</b> and the most common business address is <b>{agg.topbusinessaddr || `n/a`}</b>.
              </p>
              <h6>Maintenance code violations</h6>
              <p>
                This portfolio has an average of <b>{agg.openviolationsperresunit}</b> open HPD violations per residential unit.
                This is {(agg.openviolationsperresunit >= VIOLATIONS_AVG - 0.05 && agg.openviolationsperresunit < VIOLATIONS_AVG + 0.05)
                         ? <span><b>about the same</b> as the citywide average. </span>
                         : <span><b>{agg.openviolationsperresunit > VIOLATIONS_AVG ? 'worse' : 'better'}</b> than the citywide average of {VIOLATIONS_AVG} per residential unit. </span>}
                According to available HPD data, this portfolio has received <b>{agg.totalviolations}</b> total violations.
              </p>
              <h6>Evictions</h6>
              <p>
                In 2018, NYC Marshals scheduled <b>{agg.totalevictions > 0 ? agg.totalevictions : "0"}</b> eviction{parseInt(agg.totalevictions) === 1 ? "" : "s"} across this portfolio.
                {agg.totalevictions > 0 ?
                  <span> The building with the most evictions was&nbsp;
                    {agg.evictionsaddr && (
                      <span>
                        <b>{agg.evictionsaddr.housenumber} {agg.evictionsaddr.streetname}, {agg.evictionsaddr.boro}</b> with <b>{agg.evictionsaddr.evictions}</b> eviction{parseInt(agg.totalevictions) === 1 ? "" : "s"} that year
                      </span>
                    )}.
                  </span> : ""}
              </p>
              <h6>Rent stabilization</h6>
              <p>
                This portfolio also had an estimated <b>net {agg.totalrsdiff > 0 ? "gain" : "loss"}</b> of <b>{Math.abs(parseInt(agg.totalrsdiff, 10)) || 0}</b> rent stabilized unit{parseInt(agg.totalrsdiff) === 1 ? "" : "s"} since 2007 (gained {Math.abs(parseInt(agg.totalrsgain, 10)) || 0}, lost {Math.abs(parseInt(agg.totalrsloss, 10)) || 0}).
                This represents <b>{agg.rsproportion || 0}%</b> of the total size of this portfolio. 
                {agg.rslossaddr && (agg.rslossaddr.rsdiff < 0) ?
                (<span> The building that has lost the most units is&nbsp;
                  <b>
                    {agg.rslossaddr.housenumber} {agg.rslossaddr.streetname}, {agg.rslossaddr.boro}
                  </b>
                  , which has lost <b>{Math.abs(parseInt(agg.rslossaddr.rsdiff, 10))}</b> unit{Math.abs(parseInt(agg.rslossaddr.rsdiff, 10)) === 1 ? "" : "s"} in the past 10 years.
                 </span>) :
                 ""}
              </p>
              <aside>
                <div className="PropertiesSummary__links">
                  <span className="PropertiesSummary__linksTitle"><em>Additional links</em></span>
                  <div>
                    <h6 className="PropertiesSummary__linksSubtitle">Looking for more information?</h6>
                    <a onClick={() => {window.gtag('event', 'data-request');}} href={encodeURI(`https://docs.google.com/forms/d/e/1FAIpQLSfHdokAh4O-vB6jO8Ym0Wv_lL7cVUxsWvxw5rjZ9Ogcht7HxA/viewform?usp=pp_url&entry.1164013846=${this.props.userAddr.housenumber}+${this.props.userAddr.streetname},+${this.props.userAddr.boro}`)} target="_blank" rel="noopener noreferrer" className="btn btn-block">
                      <div>
                        <label>Send us a data request</label>
                      </div>
                    </a>
                  </div>
                  <div>
                    <h6 className="PropertiesSummary__linksSubtitle">Share this page with your neighbors</h6>
                    <SocialShare 
                      location="summary-tab"
                      url={encodeURI('https://whoownswhat.justfix.nyc/address/' + this.props.userAddr.boro + '/' + this.props.userAddr.housenumber + '/' + this.props.userAddr.streetname).replace(" ", "%20")} // Support for Android
                      twitterMessage={"The " + (parseInt(agg.bldgs) > 1 ? agg.bldgs + " " : "")  + "buildings that my landlord \"owns\" 👀... #WhoOwnsWhat @JustFixNYC"}
                      emailMessage={"The " + (parseInt(agg.bldgs) > 1 ? agg.bldgs + " " : "")  + "buildings owned by my landlord (via JustFix's Who Owns What tool)"}
                      />
                  </div>
                </div>
              </aside>
            </div>
          )}
          </div>
        <LegalFooter position="inside" />
      </div>
    );
  }
}
