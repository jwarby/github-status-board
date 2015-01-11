$(document).ready(function() {
  var query = {};
  location.search.substr(1).split('&').forEach(function(item) {
    query[item.split('=')[0]] = item.split('=')[1]}
  );
  var user = query.user;

  $('form').submit(function(ev) {
    ev.preventDefault();
    window.location.search = '?user=' + $(this).find('input').val();
  });

  Handlebars.registerHelper('moment', function(date) {
    return moment(date).fromNow();
  });

  Handlebars.registerHelper('plural', function(string, count) {
    return count === 1 ? string : string + 's';
  });

  Handlebars.registerHelper('currentYear', function() {
    return new Date().getFullYear();
  });

  var getTemplate = function(path) {
    var template = $.ajax({
      url: './templates/' + path,
      type: 'GET',
      async: false
    });

    return Handlebars.compile(template.responseText);
  };

  var render = function(path, data) {
    return getTemplate(path)(data);
  };

  Handlebars.registerPartial('footer', getTemplate('footer.hbs'));

  if (!user) {
    $('#form').removeClass('hide').siblings().addClass('hide');
    $('footer').html(render('footer.hbs'));
    return;
  } else {
    $('form').find('input').val(user);
  }

  document.title = user + '\'s project status board';

  $.get(
    'https://api.github.com/users/' + user + '/repos',
    {
      sort: 'updated'
    },
    function(repos) {
      if (repos.length === 0) {
        $('.jumbotron').toggleClass('hide');
        $('#error-NoRepos').removeClass('hide');
        return;
      }

      $('body').html(render('page/default.hbs', {
        user: repos[0].owner,
        repo_count: repos.length
      }));

      repos.forEach(function(repo) {
        var icon = repo.name.match(/(grunt|jquery|generator)/);

        if (icon && icon.length) {
          repo.icon = 'img/icon/' + icon[0] + '.png';
        }

        $('.jumbotron').find('.clearfix').before(render(
          'repository/default.hbs', repo
        ));
      });
    }
  ).fail(function(deferred, status, message) {
    $('.jumbotron').toggleClass('hide')
      .find('#error-' + message.replace(/ /g, '')).removeClass('hide');

    if (!$('.alert:visible').length) {
      $('#error-generic').removeClass('hide');
    }
  });

  $('.alert').find('.name').text(user);

  $('.alert').on('click', '[data-dismiss="alert"]', function(ev) {
    $(this).parent('.alert').addClass('hide');
  });

  $('body').on('click', '.back', function() {
    window.location.search = '';
  });
});
