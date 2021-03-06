Feature: RBAC Permissions enforcement for REST API

  Background:
    Given service description
    And the current user
    """
    { "email": "admin@testertester.com",
      "name": "Admin Tester",
      "permissions": {
        "__GGRC_ADMIN__": {
          "__GGRC_ALL__": [0]
        }
      }
    }
    """
    And a new "Context" named "context1"
    And "context1" is POSTed to its collection
    And a new "Context" named "context2"
    And "context2" is POSTed to its collection

  Scenario Outline: POST requires create permission for the context
    Given the current user
    """
    { "email": "tester@testertester.com",
      "name": "Jo Tester",
      "permissions": {
        "create": {
          "<resource_type>": [{{context.context1.value['context']['id']}}]
        }
      }
    }
    """
    And a new "<resource_type>" named "resource"
    And "resource" link property "context" is "context1"
    And current user has create permissions on resource types that "<resource_type>" depends on in context "context1"
    And current user has create permissions on resource types that "<resource_type>" depends on in context "context2"
    Then POST of "resource" to its collection is allowed
    Given a new "<resource_type>" named "resource"
    And "resource" link property "context" is "context2"
    Then POST of "resource" to its collection is forbidden

  Examples:
      | resource_type      |
      | Category           |
      | Control            |
      | ControlAssessment  |
      | ControlRisk        |
      | Cycle              |
      | DataAsset          |
      #| Directive          |
      | Contract           |
      | Policy             |
      | Regulation         |
      | Document           |
      | Facility           |
      | Help               |
      | Market             |
      | Meeting            |
      | Objective          |
      | ObjectiveControl   |
      | Option             |
      | OrgGroup           |
      | PbcList            |
      | Person             |
      | PopulationSample   |
      | Process            |
      | Product            |
      | Project            |
      | Program            |
      | ProgramDirective   |
      | Request            |
      | Response           |
      | Risk               |
      | RiskyAttribute     |
      | RiskRiskyAttribute |
      | Section            |
      | SectionObjective   |
      | System             |

  Scenario Outline: GET requires read permission for the context
    Given the current user
    """
    { "email": "tester@testertester.com",
      "name": "Jo Tester",
      "permissions": {
        "create": {
          "<resource_type>": [{{context.context1.value['context']['id']}}]
        },
        "read": {
          "<resource_type>": [{{context.context1.value['context']['id']}}]
        }
      }
    }
    """
    And a new "<resource_type>" named "resource"
    And "resource" link property "context" is "context1"
    And current user has create permissions on resource types that "<resource_type>" depends on in context "context1"
    And "resource" is POSTed to its collection
    Then GET of "resource" is allowed
    Given the current user
    """
    { "email": "bobtester@testertester.com",
      "name": "Bob Tester",
      "permissions": {
        "create": {
          "<resource_type>": [{{context.context2.value['context']['id']}}]
        },
        "read": {
          "<resource_type>": [{{context.context2.value['context']['id']}}]
        }
      }
    }
    """
    Then GET of "resource" is forbidden

  Examples:
      | resource_type      |
      | Category           |
      | Control            |
      | ControlAssessment  |
      | ControlRisk        |
      | Cycle              |
      | DataAsset          |
      #| Directive          |
      | Contract           |
      | Policy             |
      | Regulation         |
      | Document           |
      | Facility           |
      | Help               |
      | Market             |
      | Meeting            |
      | Objective          |
      | ObjectiveControl   |
      | Option             |
      | OrgGroup           |
      | PbcList            |
      | Person             |
      | PopulationSample   |
      | Process            |
      | Product            |
      | Project            |
      | Program            |
      | ProgramDirective   |
      | Request            |
      | Response           |
      | Risk               |
      | RiskyAttribute     |
      | RiskRiskyAttribute |
      | Section            |
      | SectionObjective   |
      | System             |

  Scenario Outline: PUT requires update permission for the context
    Given the current user
    """
    { "email": "tester@testertester.com",
      "name": "Jo Tester",
      "permissions": {
        "create": {
          "<resource_type>": [{{context.context1.value['context']['id']}}]
        },
        "read": {
          "<resource_type>": [{{context.context1.value['context']['id']}}]
        },
        "update": {
          "<resource_type>": [{{context.context1.value['context']['id']}}]
        }
      }
    }
    """
    And a new "<resource_type>" named "resource"
    And "resource" link property "context" is "context1"
    And current user has create permissions on resource types that "<resource_type>" depends on in context "context1"
    And "resource" is POSTed to its collection
    Then GET of "resource" is allowed
    Then PUT of "resource" is allowed
    Given the current user
    """
    { "email": "bobtester@testertester.com",
      "name": "Bob Tester",
      "permissions": {
        "read": {
          "<resource_type>": [
            {{context.context1.value['context']['id']}},
            {{context.context2.value['context']['id']}}
          ]
        },
        "update": {
          "<resource_type>": [{{context.context2.value['context']['id']}}]
        }
      }
    }
    """
    Then GET of "resource" is allowed
    Then PUT of "resource" is forbidden

  Examples:
      | resource_type      |
      | Category           |
      | Control            |
      | ControlAssessment  |
      | ControlRisk        |
      | Cycle              |
      | DataAsset          |
      #| Directive          |
      | Contract           |
      | Policy             |
      | Regulation         |
      | Document           |
      | Facility           |
      | Help               |
      | Market             |
      | Meeting            |
      | Objective          |
      | ObjectiveControl   |
      | Option             |
      | OrgGroup           |
      | PbcList            |
      | Person             |
      | PopulationSample   |
      | Process            |
      | Product            |
      | Project            |
      | Program            |
      | ProgramDirective   |
      | Request            |
      | Response           |
      | Risk               |
      | RiskyAttribute     |
      | RiskRiskyAttribute |
      | Section            |
      | SectionObjective   |
      | System             |

  Scenario Outline: DELETE requires delete permission for the context
    Given the current user
    """
    { "email": "tester@testertester.com",
      "name": "Jo Tester",
      "permissions": {
        "create": {
          "<resource_type>": [{{context.context1.value['context']['id']}}]
        },
        "read": {
          "<resource_type>": [{{context.context1.value['context']['id']}}]
        },
        "update": {
          "<resource_type>": [{{context.context1.value['context']['id']}}]
        }
      }
    }
    """
    And a new "<resource_type>" named "resource"
    And "resource" link property "context" is "context1"
    And current user has create permissions on resource types that "<resource_type>" depends on in context "context1"
    And "resource" is POSTed to its collection
    Then GET of "resource" is allowed
    Then DELETE of "resource" is forbidden 
    Given the current user
    """
    { "email": "bobtester@testertester.com",
      "name": "Bob Tester",
      "permissions": {
        "create": {
          "<resource_type>": [{{context.context1.value['context']['id']}}]
        },
        "read": {
          "<resource_type>": [{{context.context1.value['context']['id']}}]
        },
        "delete": {
          "<resource_type>": [{{context.context1.value['context']['id']}}]
        }
      }
    }
    """
    Then GET of "resource" is allowed
    Then DELETE of "resource" is allowed

  Examples:
      | resource_type      |
      | Category           |
      | Control            |
      | ControlAssessment  |
      | ControlRisk        |
      | Cycle              |
      | DataAsset          |
      #| Directive          |
      | Contract           |
      | Policy             |
      | Regulation         |
      | Document           |
      | Facility           |
      | Help               |
      | Market             |
      | Meeting            |
      | Objective          |
      | ObjectiveControl   |
      | Option             |
      | OrgGroup           |
      | PbcList            |
      | Person             |
      | PopulationSample   |
      | Process            |
      | Product            |
      | Project            |
      | Program            |
      | ProgramDirective   |
      | Request            |
      | Response           |
      | Risk               |
      | RiskyAttribute     |
      | RiskRiskyAttribute |
      | Section            |
      | SectionObjective   |
      | System             |

  Scenario: Property link objects can be included with __include if the user has read access to the target
    Given the current user
    """
    { "email": "bobtester@testertester.com",
      "name": "Bob Tester",
      "permissions": {
        "create": {
          "Contract": [
            {{context.context1.value['context']['id']}},
            {{context.context2.value['context']['id']}}
          ],
          "Program": [
            {{context.context1.value['context']['id']}},
            {{context.context2.value['context']['id']}}
          ]
        },
        "read": {
          "Contract": [
            {{context.context1.value['context']['id']}},
            {{context.context2.value['context']['id']}}
          ],
          "Program": [
            {{context.context1.value['context']['id']}},
            {{context.context2.value['context']['id']}}
          ]
        },
        "update": {
          "Contract": [
            {{context.context1.value['context']['id']}},
            {{context.context2.value['context']['id']}}
          ]
        }
      }
    }
    """
    And a new "Contract" named "directive_in_1"
    And "directive_in_1" property "kind" is "Contract"
    And "directive_in_1" link property "context" is "context1"
    And "directive_in_1" is POSTed to its collection
    And a new "Contract" named "directive_in_2"
    And "directive_in_2" property "kind" is "Contract"
    And "directive_in_2" link property "context" is "context2"
    And "directive_in_2" is POSTed to its collection
    And a new "Program" named "program"
    And "directive_in_1" is added to links property "directives" of "program"
    And "directive_in_2" is added to links property "directives" of "program"
    And "program" link property "context" is "context1"
    And "program" is POSTed to its collection
    When Querying "Program" with "program_directives.directive.kind=Contract&__include=directives"
    Then query result selfLink query string is "program_directives.directive.kind=Contract&__include=directives"
    And "program" is in query result
    And evaluate "len(context.queryresultcollection['programs_collection']['programs'][0]['directives']) == 2"
    And evaluate "'kind' in context.queryresultcollection['programs_collection']['programs'][0]['directives'][0] and 'kind' in context.queryresultcollection['programs_collection']['programs'][0]['directives'][1]"
    Given the current user
    """
    { "email": "tester@testertester.com",
      "name": "Jo Tester",
      "permissions": {
        "create": {
          "Contract": [
            {{context.context1.value['context']['id']}}
          ]
        },
        "read": {
          "Contract": [
            {{context.context1.value['context']['id']}}
          ],
          "Program": [
            {{context.context1.value['context']['id']}}
          ]
        },
        "update": {
          "Contract": [
            {{context.context1.value['context']['id']}}
          ]
        }
      }
    }
    """
    When Querying "Program" with "program_directives.directive.kind=Contract&__include=directives"
    Then query result selfLink query string is "program_directives.directive.kind=Contract&__include=directives"
    And "program" is in query result
    And evaluate "len(context.queryresultcollection['programs_collection']['programs'][0]['directives']) == 2"
    And evaluate "'kind' in context.queryresultcollection['programs_collection']['programs'][0]['directives'][0] != 'kind' in context.queryresultcollection['programs_collection']['programs'][0]['directives'][1]"
    Given the current user
    """
    { "email": "alicetester@testertester.com",
      "name": "Alice Tester",
      "permissions": {
        "read": {
          "Contract": [333],
          "Program": [
            {{context.context1.value['context']['id']}}
          ]
        },
        "update": {
          "Contract": [
            {{context.context1.value['context']['id']}}
          ]
        }
      }
    }
    """
    When Querying "Program" with "program_directives.directive.kind=Contract&__include=directives"
    Then query result selfLink query string is "program_directives.directive.kind=Contract&__include=directives"
    And "program" is not in query result

  Scenario Outline: A single query parameter supplied to a collection finds matching resources in contexts that the user is authorized to for read
    Given the current user
    """
    { "email": "bobtester@testertester.com",
      "name": "Bob Tester",
      "permissions": {
        "create": {
          "<resource_type>": [
            {{context.context1.value['context']['id']}},
            {{context.context2.value['context']['id']}}
          ]
        },
        "read": {
          "<resource_type>": [
            {{context.context1.value['context']['id']}},
            {{context.context2.value['context']['id']}}
          ]
        },
        "update": {
          "<resource_type>": [
            {{context.context1.value['context']['id']}},
            {{context.context2.value['context']['id']}}
          ]
        }
      }
    }
    """
    Given a new "<resource_type>" named "resource1"
    And a new "<resource_type>" named "resource2"
    And "resource1" property "<property_name>" is "<match_value>"
    And "resource2" property "<property_name>" is "<match_value>"
    And "resource1" link property "context" is "context1"
    And "resource2" link property "context" is "context2"
    And current user has create permissions on resource types that "<resource_type>" depends on in context "context1"
    And current user has create permissions on resource types that "<resource_type>" depends on in context "context2"
    And "resource1" is POSTed to its collection
    And "resource2" is POSTed to its collection
    When Querying "<resource_type>" with "<property_name>=<match_value>"
    And GET of the resource "resource1"
    And GET of the resource "resource2"
    Then query result selfLink query string is "<property_name>=<match_value>"
    And "resource1" is in query result
    And "resource2" is in query result
    Given the current user
    """
    { "email": "tester@testertester.com",
      "name": "Jo Tester",
      "permissions": {
        "create": {
          "<resource_type>": [
            {{context.context1.value['context']['id']}}
          ]
        },
        "read": {
          "<resource_type>": [
            {{context.context1.value['context']['id']}}
          ]
        },
        "update": {
          "<resource_type>": [
            {{context.context1.value['context']['id']}}
          ]
        }
      }
    }
    """
    When Querying "<resource_type>" with "<property_name>=<match_value>"
    Then query result selfLink query string is "<property_name>=<match_value>"
    And "resource1" is in query result
    And "resource2" is not in query result

  Examples: Resources
      | resource_type | property_name | match_value         |
      | Category      | name          | category1           |
      | Category      | scope_id      | 3                   |
      | Help          | title         | foo                 |
      | Program       | start_date    | 2013-06-03T00:00:00 |
      | Cycle         | start_at      | 2013-06-03          |

