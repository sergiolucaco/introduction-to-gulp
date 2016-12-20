angular.module('app.core').run(['$templateCache', function($templateCache) {$templateCache.put('app/customers/customer-detail.html','<section class=mainbar><section class=matter><div class=container><div><button class="btn btn-info btn-form-md" ng-click=vm.goBack()><i class="fa fa-hand-o-left"></i>Back</button> <button class="btn btn-info btn-form-md" ng-click=vm.cancel() ng-disabled=vm.isUnchanged()><i class="fa fa-undo"></i>Cancel</button> <button class="btn btn-info btn-form-md" ng-click=vm.save() ng-disabled="form.$invalid || vm.isUnchanged()"><i class="fa fa-save"></i>Save</button><span ng-hide=vm.isUnchanged() class="dissolve-animation ng-hide flag-haschanges"><i class="fa fa-asterisk fa fa-asterisk-large" rel=tooltip title="You have changes"></i></span></div><div class="widget wblue"><div ht-widget-header title="Edit {{vm.getFullName() || \'New Customer\'}}"></div><div class="widget-content user"><div class=form-group><label class=control-label>ID:</label> <label class=control-label>{{vm.customer.id}}</label></div><div class=form-group><label class=control-label>First Name</label><div><input class=form-control ng-model=vm.customer.firstName placeholder="First Name"></div></div><div class=form-group><label class=control-label>Last Name</label><div><input class=form-control ng-model=vm.customer.lastName placeholder="Last Name"></div></div><div class=form-group><label class=control-label>City</label><div><input class=form-control ng-model=vm.customer.city placeholder=City></div></div><div class=form-group><label class=control-label>State</label><div><input class=form-control ng-model=vm.customer.state placeholder=State></div></div><div class=form-group><label class=control-label>Postal Code</label><div><input class=form-control ng-model=vm.customer.zip placeholder="Postal Code"></div></div><div class=form-group><img ht-img-person={{vm.customer.thumbnail}} class=img-thumbnail></div></div></div></div></section></section>');
$templateCache.put('app/customers/customers.html','<section class=mainbar><section class=matter><div class=container><div class=row><div class="widget wblue"><div ht-widget-header title={{vm.title}}></div><div class="widget-content user"><input ng-model=vm.filter placeholder="Find customers" type=search><table class="table table-condensed table-hover"><thead><tr><th>Customer</th><th>City</th><th>State</th></tr></thead><tbody><tr ng-repeat="c in vm.customers | filter:vm.filter track by c.id" ng-click=vm.gotoCustomer(c)><td>{{c.firstName + \' \' + c.lastName}}</td><td>{{c.city}}</td><td>{{c.state}}</td></tr></tbody></table></div><div class=widget-foot><div class=clearfix></div></div></div></div></div></section></section>');
$templateCache.put('app/dashboard/dashboard.html','<section id=dashboard-view class=mainbar><section class=matter><div class=container><div class=row><div class=col-md-12><ul class=today-datas><li class=borange><div class=pull-left><i class="fa fa-coffee"></i></div><div class="datas-text pull-right"><a href=http://www.gulpjs.com><span class=bold>Gulp</span></a></div><div class=clearfix></div></li><li class=bviolet><div class=pull-left><i class="fa fa-users"></i></div><div class="datas-text pull-right"><span class=bold>{{vm.customers.length}}</span> Customers</div><div class=clearfix></div></li></ul></div></div><div class=row><div class="widget wblue"><div ht-widget-header title="Recent Customers" allow-collapse=true></div><div class="widget-content text-center text-info"><div class=container><ul class="row image-group"><li ng-repeat="c in vm.customers | limitTo:12 | orderBy:\'name\'" ng-click=vm.gotoCustomer(c) class="col-lg-2 col-md-2 col-sm-3 col-xs-4"><div class=user title="Go to speaker details"><img ht-img-person={{c.thumbnail}} class="img-thumbnail stacked"><div><small>{{c.firstName}}</small></div><div><small>{{c.lastName}}</small></div></div></li></ul></div></div><div class=widget-foot><div class=clearfix></div></div></div></div></div></section></section>');
$templateCache.put('app/widgets/widget-header.html','<div class=widget-head><div class="page-title pull-left">{{title}}</div><small class=page-title-subtle ng-show=subtitle>({{subtitle}})</small><div class="widget-icons pull-right" ng-if=allowCollapse><a ht-widget-minimize></a></div><small class="pull-right page-title-subtle" ng-show=rightText>{{rightText}}</small><div class=clearfix></div></div>');
$templateCache.put('app/layout/ht-top-nav.html','<nav class="navbar navbar-fixed-top navbar-inverse"><div class=navbar-header><a href="/" class=navbar-brand><span class=brand-title>{{vm.title}}</span></a> <a class="btn navbar-btn navbar-toggle" data-toggle=collapse data-target=.navbar-collapse><span class=icon-bar></span> <span class=icon-bar></span> <span class=icon-bar></span></a></div><div class="navbar-collapse collapse"><div class="pull-right navbar-logo"><ul class="nav navbar-nav pull-right"><li><a ng-href={{vm.tagline.link}} target=_blank>{{vm.tagline.text}}</a></li><li class="dropdown dropdown-big"><a href=http://www.angularjs.org target=_blank><img src=images/AngularJS-small.png></a></li><li><a href="http://www.gulpjs.com/" target=_blank><img src=images/gulp-tiny.png></a></li></ul></div></div></nav>');
$templateCache.put('app/layout/shell.html','<div ng-controller="Shell as vm"><header class=clearfix><ht-top-nav title=vm.title tagline=vm.tagline></ht-top-nav></header><section id=content class=content><div ng-include="\'app/layout/sidebar.html\'"></div><div ui-view class=shuffle-animation></div><div ngplus-overlay ngplus-overlay-delay-in=50 ngplus-overlay-delay-out=700 ngplus-overlay-animation=dissolve-animation><img src=../../content/images/busy.gif><div class="page-spinner-message overlay-message">{{vm.busyMessage}}</div></div></section></div>');
$templateCache.put('app/layout/sidebar.html','<div ng-controller="Sidebar as vm"><ht-sidebar when-done-animating=vm.sidebarReady()><div class=sidebar-filler></div><div class=sidebar-dropdown><a href=#>Menu</a></div><div class=sidebar-inner><div class=sidebar-widget></div><ul class=navi><li class="nlightblue fade-selection-animation" ng-class=vm.isCurrent(r) ng-repeat="r in vm.navRoutes"><a ui-sref={{r.name}} ng-bind-html=r.settings.content></a></li></ul></div></ht-sidebar></div>');}]);