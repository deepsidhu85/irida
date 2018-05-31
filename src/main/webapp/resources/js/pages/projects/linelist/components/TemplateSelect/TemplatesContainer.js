import { connect } from "react-redux";
import { actions } from "../../reducers/templates";
import { Templates } from "../TemplateSelection/Templates";

const mapStateToProps = state => ({
  templates: state.templates.get("templates"),
  current: state.templates.get("current"),
  modified: state.templates.get("modified"),
  saving: state.templates.get("saving"),
  saved: state.templates.get("saved")
});

const mapDispatchToProps = dispatch => ({
  useTemplate: index => dispatch(actions.use(index)),
  saveTemplate: (name, fields, id) =>
    dispatch(actions.saveTemplate(name, fields, id))
});

export const TemplatesContainer = connect(mapStateToProps, mapDispatchToProps)(
  Templates
);
