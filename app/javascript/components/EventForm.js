import React, { useState, useRef, useEffect, useCallback } from 'react';
import Pikaday from 'pikaday';
import 'pikaday/css/pikaday.css';
import { formatDate, isEmptyObject, validateEvent } from '../helpers/helpers';
import PropTypes from 'prop-types';
import { useParams, Link } from 'react-router-dom';

const EventForm = ( { onSave, events } ) => {
    const { id } = useParams();
    const cancelURL = event.id ? `/events/${event.id}` : '/events';
    const title = event.id ? `${event.event_date} - ${event.event_type}` : 'New Event';

    const initialEventState = useCallback(
      () => {
        const defaults = {
          event_type: '',
          event_date: '',
          title: '',
          speaker: '',
          host: '',
          published: false,
        };

        const currEvent = id ? events.find((e) => e.id === Number(id)) : {};
        return { ...defaults, ...currEvent }
      }, [events, id]
    );
    const [event, setEvent] = useState(initialEventState);
    const [formErrors, setFormErrors] = useState({});
    const dateInput = useRef(null);

    useEffect(() => {
        const p = new Pikaday({
            field: dateInput.current,
            toString: date => formatDate(date),
            onSelect: (date) => {
                const formattedDate = formatDate(date);
                dateInput.current.value = formattedDate;
                // Pikadayで選択された時に直接stateを更新する
                setEvent((prevEvent) => ({ ...prevEvent, event_date: formattedDate }));
            },
        });
        // クリーンアップ用の関数を返す
        return () => p.destroy();
    }, []);

    useEffect(() => {
      setEvent(initialEventState);
    }, [events]);

    const updateEvent = (key, value) => {
        setEvent((prevEvent) => ({ ...prevEvent, [key]: value }));
    };

    const handleInputChange = (e) => {
      const { target } = e;
      const { name } = target;
      const value = target.type === 'checkbox' ? target.checked : target.value;
      // updateEvent(name, value);

      if (name === 'event_date') {
        updateEvent(name, dateInput.current.value);
      } else {
        updateEvent(name, value);
      }
    };

    const renderErrors = () => {
      if (isEmptyObject(formErrors)) return null;
      return (
        <div className="errors">
          <h3>The following errors prohibited the event from being saved:</h3>
          <ul>
            {Object.values(formErrors).map((formError) => (
              <li key={formError}>{formError}</li>
            ))}
          </ul>
        </div>
      );
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const errors = validateEvent(event);
      if (!isEmptyObject(errors)) {
        setFormErrors(errors)
      } else {
        onSave(event); // propsから受け取った関数を呼ぶ
      }
    };

    return (
    <section>

      <h2>{title}</h2>
      {renderErrors()}

      <form className="eventForm" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="event_type">
            <strong>Type:</strong>
            <input
              type="text"
              id="event_type"
              name="event_type"
              onChange={handleInputChange}
              value={event.event_type}
            />
          </label>
        </div>
        <div>
          <label htmlFor="event_date">
            <strong>Date:</strong>
            <input
                type="text"
                id="event_date"
                name="event_date"
                ref={dateInput}
                autoComplete="off"
                value={event.event_date}
                onChange={handleInputChange}
            />
          </label>
        </div>
        <div>
          <label htmlFor="title">
            <strong>Title:</strong>
            <textarea
              cols="30"
              rows="10"
              id="title"
              name="title"
              onChange={handleInputChange}
              value={event.title}
            />
          </label>
        </div>
        <div>
          <label htmlFor="speaker">
            <strong>Speakers:</strong>
            <input
              type="text"
              id="speaker"
              name="speaker"
              onChange={handleInputChange}
              value={event.speaker}
            />
          </label>
        </div>
        <div>
          <label htmlFor="host">
            <strong>Hosts:</strong>
            <input
              type="text"
              id="host"
              name="host"
              onChange={handleInputChange}
              value={event.host}
            />
          </label>
        </div>
        <div>
          <label htmlFor="published">
            <strong>Publish:</strong>
            <input
              type="checkbox"
              id="published"
              name="published"
              onChange={handleInputChange}
              checked={event.published}
            />
          </label>
        </div>
        <div className="form-actions">
          <button type="submit">Save</button>
          <Link to={cancelURL}>Cancel</Link>
        </div>
      </form>
    </section>
    );
}

export default EventForm;

EventForm.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      event_type: PropTypes.string.isRequired,
      event_date: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      speaker: PropTypes.string.isRequired,
      host: PropTypes.string.isRequired,
      published: PropTypes.bool.isRequired,
    })
  ),
  onSave: PropTypes.func.isRequired,
};

EventForm.defaultProps = {
  events: [],
};