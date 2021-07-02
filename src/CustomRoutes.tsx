import React from "react";
import { Route } from "react-router-dom";
import plcControl from "./PlcControl";
import setPoints from "./SetPoints";
import Setup from "./configuration/Configuration";

export default [
    <Route exact path="/control" component={plcControl} /* noLayout */ />,
    <Route exact path="/set-points" component={setPoints} /* noLayout */ />,
    <Route exact path="/setup" component={Setup} /* noLayout */ />,
];