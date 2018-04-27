import React, { Component } from 'react'
import PlacesAutocomplete from 'react-places-autocomplete'
import { classnames } from '../functions/helpers'
import PoweredByGoogle from '../images/powered_by_google_default.png'
import PropTypes from 'prop-types'

import '../styles/component-styles/PlacesAutoComplete.css'

class SelectAddress extends Component {
  constructor (props) {
    super(props)
    this.state = {
      address: '',
      errorMessage: ''
    }
  }

  handleChange = address => {
    this.setState({
      address,
      errorMessage: ''
    })
  }

  handleSelect = selected => {
    const { handler } = this.props
    this.setState({address: selected}, () => { const { ...state } = this.state; handler(state.address) })
  }

  handleCloseClick = () => {
    const { handler } = this.props
    this.setState({address: ''}, () => { const { ...state } = this.state; handler(state.address) })
  }

  handleError = (status, clearSuggestions) => {
    if (status === 'ZERO_RESULTS') {
      status = 'INGA RESULTAT'
    }
    this.setState({ errorMessage: status }, () => {
      clearSuggestions()
    })
  }

  render () {
    const { ...state } = this.state
    const { ...props } = this.props

    return (

      <div>
        <PlacesAutocomplete
          onChange={this.handleChange}
          value={state.address}
          onSelect={this.handleSelect}
          onError={this.handleError}
          shouldFetchSuggestions={state.address.length > 1}
          searchOptions={props.options}
        >
          {({ getInputProps, suggestions, getSuggestionItemProps }) => {
            return (
              <div className="AddressComplete_search-bar-container">
                <div className="AddressComplete_search-input-container">
                  <input
                    {...getInputProps({
                      placeholder: 'Sök adress...',
                      className: 'AddressComplete_search-input',
                      tabIndex: props.tab_index
                    })}
                  />
                  {state.address.length > 0 && (
                    <button
                      className="AddressComplete_clear-button"
                      onClick={this.handleCloseClick}
                    >
                      x
                    </button>
                  )}
                </div>
                {suggestions.length > 0 && (
                  <div className="AddressComplete_autocomplete-container">
                    {suggestions.map(suggestion => {
                      const className = classnames('AddressComplete_suggestion-item', {
                        'AddressComplete_suggestion-item--active': suggestion.active
                      })

                      return (
                        /* eslint-disable react/jsx-key */
                        <div
                          {...getSuggestionItemProps(suggestion, { className })}
                        >
                          <strong>
                            {suggestion.formattedSuggestion.mainText}
                          </strong>{' '}
                          <small>
                            {suggestion.formattedSuggestion.secondaryText}
                          </small>
                        </div>
                      )
                      /* eslint-enable react/jsx-key */
                    })}
                    <div className="AddressComplete_dropdown-footer">
                      <div>
                        <img
                          src={PoweredByGoogle}
                          alt="Powered by Google"
                          className="AddressComplete_dropdown-footer-image"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          }}
        </PlacesAutocomplete>
        {state.errorMessage.length > 0 && (
          <div className="AddressComplete_error-message">{state.errorMessage}</div>
        )}
      </div>

    )
  }
}

SelectAddress.propTypes = {
  handler: PropTypes.func
}

export default SelectAddress
