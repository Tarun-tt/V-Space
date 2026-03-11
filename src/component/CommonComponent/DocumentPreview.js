import React from "react";
import ActionButton from "./ActionButtons";

const DocumentPreview = ({ isScanModalOpen, closeScanModal, actionsfile }) => {
  return (
    <div className="col-md-5 pl-0">
      <div className="docPreview">
        {/* <h2>Customer 1 documents Preview</h2> */}
        <div className="docImg scroll-on-hover">
          <div className="ds-dwt-content ds-dwt-center">
            <div id="DWTcontainerTop">
              <div id="divEdit">
                <ul className="operateGrp">
                  <li></li>
                  <li></li>
                  <li className="lblShowCurrentImage">
                    <input type="text" size="2" id="DW_CurrentImage" readOnly />
                    /
                    <input type="text" size="2" id="DW_TotalImage" readOnly />
                  </li>
                  <li className="lblZoom">
                    <ul>
                      <li style={{ width: "25%" }}>
                        <div
                          className="menuIcon ZoomOut"
                          title="Zoom out"
                          alt="Zoom out"
                          id="btnZoomOut"
                          onClick={() => window.btnZoomOut_onclick()}
                        ></div>
                      </li>
                      <li style={{ width: "50%" }}>
                        <input type="text" id="DW_spanZoom" readOnly />
                      </li>
                      <li style={{ width: "25%" }}>
                        <div
                          className="menuIcon ZoomIn"
                          title="Zoom in"
                          alt="Zoom in"
                          id="btnZoomIn"
                          onClick={() => window.btnZoomIn_onclick()}
                        ></div>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <div
                      style={{ marginLeft: "10px" }}
                      className="menuIcon OrigSize"
                      title="1:1"
                      alt="1:1"
                      id="btnOrigSize"
                      onClick={() => window.btnOrigSize_onclick()}
                    ></div>
                    <div
                      className="menuIcon FitWindow"
                      title="Fit To Window"
                      alt="Fit To Window"
                      id="btnFitWindow"
                      style={{ display: "none" }}
                      onClick={() => window.btnFitWindow_onclick()}
                    ></div>
                  </li>
                  <li style={{ width: "50px" }}></li>
                  <li>
                    <div
                      className="menuIcon RotateLeft"
                      title="Rotate left"
                      alt="Rotate left"
                      id="btnRotateL"
                      onClick={() => window.btnRotateLeft_onclick()}
                    ></div>
                  </li>
                  <li>
                    <div
                      className="menuIcon grayimg Crop"
                      title="Please select an area to crop."
                      alt="Please select an area to crop."
                      id="btnCropGray"
                    ></div>
                    <div
                      className="menuIcon Crop"
                      title="Crop"
                      alt="Crop"
                      id="btnCrop"
                      style={{ display: "none" }}
                      onClick={() => window.btnCrop_onclick()}
                    ></div>
                  </li>
                  <li>
                    <div
                      className="menuIcon ShowEditor"
                      title="Show image editor"
                      alt="Show image editor"
                      id="btnShowImageEditor"
                      onClick={() => window.ghostEditor()}
                    ></div>
                  </li>
                  <li style={{ marginTop: 0 }}>
                    <div
                      className="menuIcon SelectSelected"
                      title="Select"
                      alt="Select"
                      id="btnSelect_selected"
                    ></div>
                    <div
                      className="menuIcon Select"
                      style={{ display: "none" }}
                      title="Select"
                      alt="Select"
                      id="btnSelect"
                      onClick={() => window.btnSelect_onclick()}
                    ></div>
                  </li>
                  <li style={{ marginTop: 0 }}>
                    <div
                      className="menuIcon HandSelected"
                      style={{ display: "none" }}
                      title="Hand"
                      alt="Hand"
                      id="btnHand_selected"
                    ></div>
                    <div
                      className="menuIcon Hand"
                      title="Hand"
                      alt="Hand"
                      id="btnHand"
                      onClick={() => window.btnHand_onclick()}
                    ></div>
                  </li>
                </ul>
              </div>
              <div id="dwtcontrolContainer" style={{ border: "groove" }}></div>
            </div>

            {/* Modal */}
            <div
              className={`modal fade ${isScanModalOpen ? "show d-block" : ""}`}
              tabIndex="-1"
              role="dialog"
            >
              <div
                className="modal-dialog modal-dialog-centered"
                role="document"
              >
                <div className="modal-content">
                  <div className="modal-header d-flex justify-content-between align-items-center">
                    <h5 className="modal-title">Custom Scan</h5>
                    <button
                      type="button"
                      className="close"
                      onClick={closeScanModal}
                      aria-label="Close"
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <div id="div_ScanImage" className="divTableStyle">
                      <ul id="ulScaneImageHIDE">
                        <li>
                          <label htmlFor="source">
                            <p>Select Source:</p>
                          </label>
                          <select id="source" className="form-control">
                            <option value=""></option>
                          </select>
                        </li>
                        <li id="divProductDetail">
                          <ul id="divTwainType">
                            <li className="d-flex justify-content-between">
                              <label htmlFor="ShowUI">
                                <input type="checkbox" id="ShowUI" /> Show
                                Scanner UI
                              </label>
                              <label htmlFor="ADF">
                                <input type="checkbox" id="ADF" /> Use ADF
                              </label>
                            </li>
                            <li className="d-flex justify-content-between">
                              <label htmlFor="DiscardBlankPage">
                                <input type="checkbox" id="DiscardBlankPage" />{" "}
                                Auto Remove Blank Page
                              </label>
                              <label htmlFor="Duplex">
                                <input type="checkbox" id="Duplex" /> 2-sided
                                Scan
                              </label>
                            </li>
                            <li>
                              <span>Pixel Type:</span>
                              <label htmlFor="BW" className="ml-2">
                                <input type="radio" id="BW" name="PixelType" />{" "}
                                B&W
                              </label>
                              <label htmlFor="Gray" className="ml-2">
                                <input
                                  type="radio"
                                  id="Gray"
                                  name="PixelType"
                                />{" "}
                                Gray
                              </label>
                              <label htmlFor="RGB" className="ml-2">
                                <input type="radio" id="RGB" name="PixelType" />{" "}
                                Color
                              </label>
                            </li>
                            <li>
                              <span>Resolution:</span>
                              <select
                                id="Resolution"
                                className="form-control w-auto d-inline-block ml-2"
                                defaultValue="200"
                              >
                                <option value="100">100</option>
                                <option value="150">150</option>
                                <option value="200">200</option>
                                <option value="300">300</option>
                              </select>
                            </li>
                          </ul>
                        </li>
                        <li className="mt-3">
                          {/* <input
                            id="btnScan"
                            className="btn btn-primary"
                            disabled
                            type="button"
                            value="Scan"
                            onClick={() => window.scanFile()}
                          /> */}
                          <button
                            id="btnScan"
                            className="btn btn-primary"
                            type="button"
                            onClick={() => {
                              // console.log("Scan button clicked");
                              window.scanFile();
                            }}
                            ref={(el) => {
                              if (el) {
                                el.disabled = false; // Force enable via ref
                                el.style.opacity = 1;
                                el.style.pointerEvents = "auto";
                              }
                            }}
                          >
                            Scan
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {actionsfile?.length > 0 && (
        <div
          className="btnWrapper docPrevBtn"
          style={{ position: "absolute", bottom: "0", width: "100%" }}
        >
          <ul className="pl-0 ml-0 d-flex align-items-center justify-content-between">
            {actionsfile.map((action, index) => (
              <li key={index}>
                <ActionButton {...action} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DocumentPreview;
