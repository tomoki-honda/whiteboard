import React, { PureComponent } from "react";

class SWRegister extends PureComponent {
  componentDidMount() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register('/assets/js/sw.js')
        .then((reg) => {
          console.log("service worker registration successful", reg);
        })
        .catch(err => {
          console.warn("service worker registration failed", err.message);
        });
    }
  }

  render() {
    return (<></>);
  }
}

export default SWRegister;
