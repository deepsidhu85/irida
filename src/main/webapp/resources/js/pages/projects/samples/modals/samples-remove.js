/**
 * This script if for copying and moving samples from projects.
 * Loaded when the modal for either copying or moving samples is displayed.
 */
import $ from "jquery";
import { SAMPLE_EVENTS } from "../constants";

$(".js-remove-form").submit(function(e) {
  e.preventDefault();

  $.post($("#js-submit").data("url"), $(this).serialize(), function(response) {
    /*
    Close the modal
     */
    $("#js-modal-wrapper").trigger(SAMPLE_EVENTS.SAMPLE_TOOLS_CLOSED);

    if (response.success)
      window.notifications.show({
        type: "success",
        msg: response.message
      });
  });
});
