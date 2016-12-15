(function() {
    'use strict';

    angular
        .module('app.dashboard')
        .controller('Dashboard', Dashboard);

    Dashboard.$inject = ['$state', 'dataservice', 'logger']; // this allow AngularJS to locate variables when JS is mangled. 
    // It can also be done automated with gulp.
    function Dashboard($state, dataservice, logger) {
        var vm = this;
        vm.customers = [];
        vm.gotoCustomer = gotoCustomer;
        vm.title = 'Dashboard';

        activate();

        function activate() {
            return getCustomers().then(function() {
                logger.info('Activated Dashboard ');
            });
        }

        function getCustomers() {
            return dataservice.getCustomers().then(function(data) {
                vm.customers = data;
                return vm.customers;
            });
        }

        function gotoCustomer(c) {
            $state.go('customer.detail', {id: c.id});
        }
    }
})();
