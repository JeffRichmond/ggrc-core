# Copyright (C) 2013 Google Inc., authors, and contributors <see AUTHORS file>
# Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
# Created By: dan@reciprocitylabs.com
# Maintained By: dan@reciprocitylabs.com

from ggrc import db
from .mixins import Base

class SectionObjective(Base, db.Model):
  __tablename__ = 'section_objectives'

  __table_args__ = (
    db.UniqueConstraint('section_id', 'objective_id'),
  )

  section_id = db.Column(db.Integer, db.ForeignKey('sections.id'), nullable = False)
  objective_id = db.Column(db.Integer, db.ForeignKey('objectives.id'), nullable = False)

  _publish_attrs = [
      'section',
      'objective',
      ]

  @classmethod
  def eager_query(cls):
    from sqlalchemy import orm

    query = super(SectionObjective, cls).eager_query()
    return query.options(
        orm.subqueryload('section'),
        orm.subqueryload('objective'))

  def _display_name(self):
    return self.section.display_name + '<->' + self.objective.display_name
