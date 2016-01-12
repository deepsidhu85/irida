(function (ng) {
	"use strict";

	function SamplesController($scope, $templateCache, $compile, service, DTOptionsBuilder) {
		var vm = this;
		vm.selected = {};
		vm.dtInstance = {};

		vm.dtOptions = DTOptionsBuilder.newOptions()
			.withDOM("<'row filter-row'<'col-sm-9 buttons'><'col-sm-3'0f>><'row datatables-active-filters'1><'panel panel-default''<'row'<'col-sm-12'tr>>><'row'<'col-sm-3'l><'col-sm-6'p><'col-sm-3 text-right'i>>");

		vm.updateAllSelected = function () {
			vm.samples.forEach(function (sample, index) {
				vm.selected[index] = vm.allSelected;
			});
		};

		vm.sampleChanged = function (index) {
			if (vm.selected.length === vm.samples.length) {
				vm.allSelected = true;
			} else {
				vm.allSelected = false;
			}
		};

		service.fetchSamples().then(function (samples) {
			vm.samples = samples;
		});


		var buttons = $templateCache.get("buttons.html");

		vm.dtInstanceCallback = function(instance) {
			vm.dtInstance = instance;

			vm.dtInstance.DataTable.on("draw.dt", function () {
				console.log('Drawn');
				ng.element(".buttons").html($compile(buttons)($scope));
			});
		};
	}

	ng.module("irida.projects.samples.controller", ["irida.projects.samples.service", "datatables"])
		.controller("SamplesController", ["$scope", "$templateCache", "$compile", "samplesService", "DTOptionsBuilder", SamplesController]);
	;
})(window.angular);