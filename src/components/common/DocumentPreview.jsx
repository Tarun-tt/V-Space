import React from "react";
import Box from "@mui/material/Box";
import ActionButton from "./ActionButtons";

const DocumentPreview = ({ isScanModalOpen, closeScanModal, actionsfile }) => {
  return (
    <Box className="col-md-8 pl-0">
      <Box className="docPreview">
        {/* <h2>Customer 1 documents Preview</h2> */}
        <Box className="docImg scroll-on-hover">
          <Box className="ds-dwt-content ds-dwt-center">
            <Box id="DWTcontainerTop">
              <Box id="divEdit">
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
                        <Box
                          className="menuIcon ZoomOut"
                          title="Zoom out"
                          alt="Zoom out"
                          id="btnZoomOut"
                          onClick={() => window.btnZoomOut_onclick()}
                        ></Box>
                      </li>
                      <li style={{ width: "50%" }}>
                        <input type="text" id="DW_spanZoom" readOnly />
                      </li>
                      <li style={{ width: "25%" }}>
                        <Box
                          className="menuIcon ZoomIn"
                          title="Zoom in"
                          alt="Zoom in"
                          id="btnZoomIn"
                          onClick={() => window.btnZoomIn_onclick()}
                        ></Box>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <Box
                      style={{ marginLeft: "10px" }}
                      className="menuIcon OrigSize"
                      title="1:1"
                      alt="1:1"
                      id="btnOrigSize"
                      onClick={() => window.btnOrigSize_onclick()}
                    ></Box>
                    <Box
                      className="menuIcon FitWindow"
                      title="Fit To Window"
                      alt="Fit To Window"
                      id="btnFitWindow"
                      style={{ display: "none" }}
                      onClick={() => window.btnFitWindow_onclick()}
                    ></Box>
                  </li>
                  <li style={{ width: "50px" }}></li>
                  <li>
                    <Box
                      className="menuIcon RotateLeft"
                      title="Rotate left"
                      alt="Rotate left"
                      id="btnRotateL"
                      onClick={() => window.btnRotateLeft_onclick()}
                    ></Box>
                  </li>
                  <li>
                    <Box
                      className="menuIcon grayimg Crop"
                      title="Please select an area to crop."
                      alt="Please select an area to crop."
                      id="btnCropGray"
                    ></Box>
                    <Box
                      className="menuIcon Crop"
                      title="Crop"
                      alt="Crop"
                      id="btnCrop"
                      style={{ display: "none" }}
                      onClick={() => window.btnCrop_onclick()}
                    ></Box>
                  </li>
                  <li>
                    <Box
                      className="menuIcon ShowEditor"
                      title="Show image editor"
                      alt="Show image editor"
                      id="btnShowImageEditor"
                      onClick={() => window.ghostEditor()}
                    ></Box>
                  </li>
                  <li style={{ marginTop: 0 }}>
                    <Box
                      className="menuIcon SelectSelected"
                      title="Select"
                      alt="Select"
                      id="btnSelect_selected"
                    ></Box>
                    <Box
                      className="menuIcon Select"
                      style={{ display: "none" }}
                      title="Select"
                      alt="Select"
                      id="btnSelect"
                      onClick={() => window.btnSelect_onclick()}
                    ></Box>
                  </li>
                  <li style={{ marginTop: 0 }}>
                    <Box
                      className="menuIcon HandSelected"
                      style={{ display: "none" }}
                      title="Hand"
                      alt="Hand"
                      id="btnHand_selected"
                    ></Box>
                    <Box
                      className="menuIcon Hand"
                      title="Hand"
                      alt="Hand"
                      id="btnHand"
                      onClick={() => window.btnHand_onclick()}
                    ></Box>
                  </li>
                </ul>
              </Box>
              <Box id="dwtcontrolContainer" style={{ border: "groove" }}></Box>
            </Box>

            {/* Modal */}
            <Box
              className={`modal fade ${isScanModalOpen ? "show d-block" : ""}`}
              tabIndex="-1"
              role="dialog"
            >
              <Box
                className="modal-dialog modal-dialog-centered"
                role="document"
              >
                <Box className="modal-content">
                  <Box className="modal-header d-flex justify-content-between align-items-center">
                    <h5 className="modal-title">Custom Scan</h5>
                    <button
                      type="button"
                      className="close"
                      onClick={closeScanModal}
                      aria-label="Close"
                    >
                      <Box component="span" aria-hidden="true">&times;</Box>
                    </button>
                  </Box>
                  <Box className="modal-body">
                    <Box id="div_ScanImage" className="divTableStyle">
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
                              <Box component="span">Pixel Type:</Box>
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
                              <Box component="span">Resolution:</Box>
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
                          <button
                            id="btnScan"
                            className="btn btn-primary"
                            type="button"
                            onClick={() => {
                              window.scanFile();
                            }}
                            ref={(el) => {
                              if (el) {
                                el.disabled = false;
                                el.style.opacity = 1;
                                el.style.pointerEvents = "auto";
                              }
                            }}
                          >
                            Scan
                          </button>
                        </li>
                      </ul>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      {actionsfile?.length > 0 && (
        <Box
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
        </Box>
      )}
    </Box>
  );
};

export default DocumentPreview;
