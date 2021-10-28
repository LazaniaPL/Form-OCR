<?php

namespace backend\models {
    class AvailableLanguage
    {
        private $data = array();

        
        public function __get($name)
        {
            if (array_key_exists($name, $this->data)) {
                return $this->data[$name];
            }

            $trace = debug_backtrace();
            trigger_error(
                'Undefined property via __get(): ' . $name .
                    ' in ' . $trace[0]['file'] .
                    ' on line ' . $trace[0]['line'],
                E_USER_NOTICE
            );
            return null;
        }
        //** String: $name; LanguageDetails:$value */
        public function __set($name, $value)
        {
            $this->data[$name] = $value;
        }
    }
}
