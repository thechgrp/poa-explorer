import $ from 'jquery'

// This file adds event handlers responsible for the 'Try it out' UI in the
// Etherscan-compatible API documentation page.

function composeQuery (module, action, inputs) {
  const parameters = queryParametersFromInputs(inputs)
  return `?module=${module}&action=${action}` + parameters.join('')
}

function queryParametersFromInputs (inputs) {
  return $.map(inputs, queryParameterFromInput)
}

function queryParameterFromInput (input) {
  const key = $(input).attr('data-parameter-key')
  const value = $(input).val()

  if (value === '') {
    return ''
  } else {
    return `&${key}=${value}`
  }
}

function composeRequestUrl (query) {
  const url = $('#endpoint-url').attr('data-endpoint-url')
  return `${url}${query}`
}

function composeCurlCommand (requestUrl) {
  return `curl -X GET "${requestUrl}" -H "accept: application/json"`
}

function isResultVisible (module, action) {
  return $(`#${module}-${action} .try-api-ui-result`).is(':visible')
}

function handleSuccess (query, xhr, clickedButton) {
  const module = clickedButton.attr('data-module')
  const action = clickedButton.attr('data-action')
  const curl = $(`#${module}-${action} .curl`)[0]
  const requestUrl = $(`#${module}-${action} .request-url`)[0]
  const code = $(`#${module}-${action} .server-response-code`)[0]
  const body = $(`#${module}-${action} .server-response-body`)[0]
  const url = composeRequestUrl(query)

  curl.innerHTML = composeCurlCommand(url)
  requestUrl.innerHTML = url
  code.innerHTML = xhr.status
  body.innerHTML = JSON.stringify(xhr.responseJSON, undefined, 2)
  $(`#${module}-${action} .try-api-ui-result`).show()
  $(`#${module}-${action} .btn-try-api-clear`).show()
  clickedButton.html(clickedButton.data('original-text'))
  clickedButton.prop('disabled', false)
}

// Show 'Try it out' UI for a module/action.
$('.btn-try-api').click(event => {
  const clickedButton = $(event.target)
  const module = clickedButton.attr('data-module')
  const action = clickedButton.attr('data-action')
  clickedButton.hide()
  $(`#${module}-${action} .btn-try-api-cancel`).show()
  $(`#${module}-${action} .try-api-ui`).show()

  if (isResultVisible(module, action)) {
    $(`#${module}-${action} .btn-try-api-clear`).show()
  }
})

// Hide 'Try it out' UI for a module/action.
$('.btn-try-api-cancel').click(event => {
  const clickedButton = $(event.target)
  const module = clickedButton.attr('data-module')
  const action = clickedButton.attr('data-action')
  clickedButton.hide()
  $(`#${module}-${action} .try-api-ui`).hide()
  $(`.btn-try-api-clear`).hide()
  $(`#${module}-${action} .btn-try-api`).show()
})

// Clear API server response/result, curl command, and request URL
$('.btn-try-api-clear').click(event => {
  const clickedButton = $(event.target)
  const module = clickedButton.attr('data-module')
  const action = clickedButton.attr('data-action')
  clickedButton.hide()
  $(`#${module}-${action} .try-api-ui-result`).hide()
})

// Remove invalid class from required fields if not empty
$('input.try-api-ui.required').on('keyup', (event) => {
  if (event.target.value !== '') {
    event.target.classList.remove('is-invalid')
  } else {
    event.target.classList.add('is-invalid')
  }
})

// Execute API call
//
// Makes a request to the Explorer API with a given set of user defined
// parameters. The following related information is subsequently rendered below
// the execute button:
//
//   * curl commmand
//   * requuest URL
//   * server response
//
$('.btn-try-api-execute').click(event => {
  const clickedButton = $(event.target)
  const module = clickedButton.attr('data-module')
  const action = clickedButton.attr('data-action')
  const inputs = $(`#${module}-${action} input.try-api-ui`)
  const query = composeQuery(module, action, inputs)
  const loadingText = '<i class="fa fa-spinner fa-spin"></i> loading...'

  clickedButton.prop('disabled', true)
  clickedButton.data('original-text', clickedButton.html())

  if (clickedButton.html() !== loadingText) {
    clickedButton.html(loadingText)
  }

  $.ajax({
    url: `/api${query}`,
    success: (_data, _status, xhr) => {
      handleSuccess(query, xhr, clickedButton)
    },
    error: (xhr) => {
      handleSuccess(query, xhr, clickedButton)
    }
  })
})
