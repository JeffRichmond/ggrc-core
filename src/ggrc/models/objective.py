# Copyright (C) 2013 Google Inc., authors, and contributors <see AUTHORS file>
# Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
# Created By: dan@reciprocitylabs.com
# Maintained By: dan@reciprocitylabs.com

from ggrc import db
from .associationproxy import association_proxy
from .mixins import BusinessObject
from .object_document import Documentable
from .object_person import Personable
from .reflection import PublishOnly

class Objective(Documentable, Personable, BusinessObject, db.Model):
  __tablename__ = 'objectives'

  notes = db.Column(db.Text)
  section_objectives = db.relationship('SectionObjective', backref='objective')
  sections = association_proxy('section_objectives', 'section', 'SectionObjective')
  objective_controls = db.relationship('ObjectiveControl', backref='objective')
  controls = association_proxy('objective_controls', 'control', 'ObjectiveControl')

  _publish_attrs = [
      'notes',
      PublishOnly('section_objectives'),
      'sections',
      PublishOnly('objective_controls'),
      'controls',
      ]

  @classmethod
  def eager_query(cls):
    from sqlalchemy import orm

    query = super(Objective, cls).eager_query()
    return query.options(
        orm.subqueryload_all('section_objectives.section'),
        orm.subqueryload_all('objective_controls.control'))