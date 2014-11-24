'use strict';

angular
    .module('appProfile', [])
    .directive('profileWidget', function(){
        return {
            restrict: 'A',
            templateUrl: 'http://wrio.s3-website-us-east-1.amazonaws.com/Widgets/profile-widget.html',
            scope: {},
            controller: function($scope){
                $scope.title = 'profile widget directive';
            }
        };
    });
