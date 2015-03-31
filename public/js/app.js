'use strict';

angular.module('App', ['ngMaterial', 'ui.router', 'ngResource'])

.config(function($stateProvider, $urlRouterProvider){
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'public/views/partials/home.html',
      controller: 'HomeController',
    })
    .state('panier', {
      url: '/panier',
      templateUrl: 'public/views/partials/panier.html',
      controller: 'PanierController',
    })
    .state('checkout', {
      url: '/checkout',
      templateUrl: 'public/views/partials/checkout.html',
      controller: 'CheckoutController',
    })
    ;

})

// CONTROLLERS SECTION///////////////////////////////////////////////////////////////////////////


.controller('ItemListController', function($scope, ItemService, CategoryService, SearchService){
  $scope.$watch(CategoryService.getFilter, function(oldValue, newValue){
      $scope.items = ItemService.query();
  });

  $scope.$watch(SearchService.getSearch, function(oldValue, newValue){
      $scope.items = ItemService.query();
  });

  $scope.sorts = [
    'price',
    'name',
    'description'
  ];
  $scope.sortCriteria = $scope.sorts[0];
  $scope.sortReverse = false;

})

.controller('HomeController', function($scope, $anchorScroll, $location, ArianeService, PanierController, ToastService){
  ArianeService
    .clear()
    .add('Home', '')
    .add('His', '')
    .add('Lorem ipsum', '');

  $scope.optionsHidden = false;

  $scope.toggleHideOptions = function(){
    $scope.optionsHidden = !$scope.optionsHidden;
  };

  $scope.addToCart = function(item){
    PanierController.add(item);
    ToastService.simpleToast('"' + item.name + '"' + ' was added to your panier.');
    //HACK: scroll to top to see toast. Fix it by telling the toast what its parent is.
    //$location.hash('header');
    //$anchorScroll();
  };


})

.controller('CheckoutController', function($scope, ArianeService, UserService, ToastService){
  ArianeService
    .clear()
    .add('Home', '')
    .add('His', '')
    .add('Checkout', '/checkout');

  $scope.email = '';
  $scope.password = '';
  $scope.login = function(){
    var res = UserService.isValid($scope.email, $scope.password);

    if(res){
      ToastService.simpleToast('Welcome back ' + $scope.email + ' !');
    } else {
      ToastService.simpleToast('Wrong login/password');
    }
  };

  $scope.user = {
    name: '',
    phone: '',
    email: '',
    address: '',
    deliveryAdress: '',
    billingAdress: '',
    password: ''
  };

  $scope.register = function(){
    if($scope.formRegister.$valid){
      ToastService.simpleToast('Welcome ' + $scope.user.email + ' !');
    } else {
      ToastService.simpleToast('The form is not valid, fields are missing');
    }
  };

  $scope.showRegisterForm = false;
  $scope.toggleRegisterForm = function(){
    $scope.showRegisterForm = ! $scope.showRegisterForm;
  };

})

.controller('PanierController', function($scope, ArianeService, PanierController){
  ArianeService
    .clear()
    .add('Home', '')
    .add('His', '')
    .add('Cart', '');

  var getTotalPrice = function(){
    var res = 0;

    $scope.items.map(function(i){
      res += i.price * Math.abs(i.quantity);
    });

    return res;
  };

  $scope.items = PanierController.get();

  $scope.isEmpty = function(){
    return $scope.items.length === 0;
  };

  $scope.remove = function(itemName){
    $scope.items = PanierController.remove(itemName).get();
    $scope.updateTotalPrice();
  };

  $scope.totalPrice = getTotalPrice();

  $scope.updateTotalPrice = function(){
    $scope.totalPrice = getTotalPrice();
  };

})

.controller('PresentationController', function($scope){

})

.controller('ArianeCtrl', function($scope, ArianeService){
  $scope.add = ArianeService.add;
  $scope.remove = ArianeService.remove;
  $scope.locations = ArianeService.get();

})

.controller('CategoryController', function($scope, CategoryService){
  $scope.categories = CategoryService.query();
  $scope.selectCategory = function(categoryName){
    CategoryService.setFilter(categoryName, $scope);
  };
})

.controller('SearchController', function($scope, SearchService){
  $scope.search = SearchService.getSearch();
  $scope.setSearch = SearchService.setSearch;
})

.controller('HeaderController', function($scope, PanierController){
  $scope.$watch(PanierController.get, function(oldValue, newValue){
      $scope.panierCount = PanierController.get().length;
  }, true);


})

//SERVICES SECTION////////////////////////////////////////////////////////////////////////////

.service('ArianeService', function(){
  var locations = [];

  return {
    add: function(name, url){
      locations.push({name: name, url: url});
      return this;
    },
    remove: function(){
      locations.pop();
      return this;
    },
    get: function(){
      return locations;
    },
    clear: function(){
      locations = [];
      return this;
    }
  };
})

.service('PanierController', function(){
  var items = [];

  function indexOfItem(name){
    var i = 0;
    while(i< items.length){
      if(items[i].name === name){
        return i;
      }
      i += 1;
    }
    return -1;
  }

  return {
    add: function(item, quantity){
      quantity = quantity || 1;
      item.quantity = quantity;

      var index = indexOfItem(item.name);

      if(index >= 0){
        items[index].quantity += quantity;
      } else {
        items.push(item);
      }

      return this;
    },
    remove: function(itemName){
      items = items.filter(function(item){
        return item.name !== itemName;
      });

      return this;
    },
    clear: function(){
      items = [];
      return this;
    },
    get: function(){
      return items;
    }
  };
})

.service('ToastService', function($mdToast){
  return {
    simpleToast: function(msg){
      $mdToast.show(
        $mdToast.simple()
          .content(msg)
          .position('fit bottom right')
          .hideDelay(3000)
      );
    }
  };
})

.service('ItemService', function($resource, $filter, CategoryService, SearchService){
  var Item = $resource('resources/items.json');
  var items = Item.query();

  return {
    query: function(){
      var res = items;
      var categoryName = CategoryService.getFilter();
      var search = SearchService.getSearch();

      if(categoryName){
        res = res.filter(function(item){
          return item.category === categoryName;
        });
      }

      if(search){
        res = res.filter(function(item){
          return (item.name.indexOf(search) >= 0) ||
          (item.description.indexOf(search) >= 0);
        });
      }

      return res;
    }
  };
})

.service('CategoryService', function($resource){
  var Category = $resource('resources/categories.json');
  var filter = '';

  return {
    query: function(){
      return Category.query();
    },
    getFilter: function(){
      return filter;
    },
    setFilter: function(newFilter){
      filter = newFilter;
    }
  };
})

.service('SearchService', function(){
  var search = '';

  return {
    getSearch: function(){
      return search;
    },
    setSearch: function(newSearch){
      search = newSearch;
    }
  };
})

.service('UserService', function($resource){
  var User = $resource('resources/users.json');
  var users = User.query();

  return {
    query: function(){
      return users;
    },
    isValid: function(email, password){
      return users.some(function(u){
        return u.email === email &&
        u.password === password;
      });
    }
  };
})

;
