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

  if (!user) {
    $('#form').removeClass('hide').siblings().addClass('hide');
  } else {
    $('form').find('input').val(user);
  }

  Handlebars.registerHelper('moment', function(date) {
    return moment(date).fromNow();
  });

  Handlebars.registerHelper('plural', function(string, count) {
    return count === 1 ? string : string + 's';
  });

  var template = function(path, data) {
    var template = $.ajax({
      url: './templates/' + path,
      type: 'GET',
      async: false
    });

    return Handlebars.compile(template.responseText)(data);
  };

  if (!user) {
    return;
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

      $('body').html(template('page/default.hbs', {
        user: repos[0].owner,
        title: document.title,
        repo_count: repos.length
      }));

      repos.forEach(function(repo) {
        var icon = repo.name.match(/(grunt|jquery|generator)/);

        if (icon && icon.length) {
          repo.icon = 'img/icon/' + icon[0] + '.png';
        }

        $('.jumbotron').find('.clearfix').before(template(
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
