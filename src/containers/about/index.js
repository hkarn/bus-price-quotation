import React from 'react'
import { push } from 'react-router-redux'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

const Settings = props => (
  <div>
    <h1>About</h1>
    <p>Welcome home!</p>
    <header>
        <nav>
          <ul>
            <li>
              hej
            </li>
            <li>
              hå
            </li>
            <li>
              hallo
            </li>
          </ul>
        </nav>
      </header>

      <main>
        main
      </main>
      <footer>
      main footer
      </footer>
    <button onClick={() => props.changePage()}>Go to about page via redux</button>
  </div>
)

const mapDispatchToProps = dispatch => bindActionCreators({
  changePage: () => push('/')
}, dispatch)

export default connect(
  null, 
  mapDispatchToProps
)(Settings)